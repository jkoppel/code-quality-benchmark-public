import * as path from "node:path";
import { Command, FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import dedent from "dedent";
import { Cause, Effect, Either } from "effect";
import * as tmp from "tmp";
import { ClaudeAgent } from "../agents/feature-addition/claude-agent.ts";
import { CodexAgent } from "../agents/feature-addition/codex-agent.ts";
import type { CodingAgent, FeatureAgent } from "../agents/types.ts";
import { runFunctionalityTests } from "../benchmark-lib.ts";
import { allTestsPassed } from "../benchmark-test-lib/report.ts";
import { gitCmd } from "../utils/git.ts";
import { LoggerConfig } from "../utils/logger/logger.ts";
import { jsonStringify } from "../utils/logger/pretty.ts";
import type { EvaluationConfig, EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";
import { EvaluationError } from "./errors.ts";
import { type InstanceDescriptor, makeInstances } from "./instance.ts";
import {
  type CompleteInstanceResult,
  type EvaluationResult,
  type FailedInstanceResult,
  type InstanceMetadata,
  type InstanceResult,
  isCompleteInstanceResult,
  isFailedInstanceResult,
  makeFailedInstanceResult,
  makeUpdateOnlyInfo,
  type UpdateOnlyInstanceInfo,
} from "./result.ts";

// import { geminiAgent } from './agents/feature-addition/gemini-agent.ts';

// Don't automatically cleanup - we want to keep benchmark results
// tmp.setGracefulCleanup();

export function evaluateUpdates(
  benchmarkPath: string,
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig, // TODO: Load this with Effect instead
): Effect.Effect<
  EvaluationResult,
  PlatformError,
  FileSystem.FileSystem | CommandExecutor | LoggerConfig
> {
  const startTime = new Date();

  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;

    yield* logger.info("Starting update evaluation", {
      originalProgramPath,
      updatePrompt: updatePrompt.substring(0, 100),
    });

    const instanceResults = yield* applyUpdatesToInstances(
      benchmarkPath,
      originalProgramPath,
      updatePrompt,
      workspaceDir,
      config,
    );
    const [completedEvals, failedEvals] = [
      instanceResults.filter(isCompleteInstanceResult),
      instanceResults.filter(isFailedInstanceResult),
    ];

    // Calculate total score
    const totalScore = completedEvals.reduce(
      (sum, result) => sum + result.score,
      0,
    );

    // Make EvaluationResult
    const endTime = new Date();
    const metadata: EvaluationMetadata = {
      startTime,
      endTime,
      totalDuration: endTime.getTime() - startTime.getTime(),
      config,
    };
    const result: EvaluationResult = {
      originalProgramSource: { type: "pre-existing" },
      updatePrompt,
      originalProgramPath,
      updates: instanceResults,
      metadata,
      totalScore,
    };

    // Save complete results to JSON
    const resultsPath = path.join(workspaceDir, "evaluation-results.json");

    const fs = yield* FileSystem.FileSystem;
    yield* fs.writeFileString(resultsPath, JSON.stringify(result, null, 2));
    yield* logger.info(`Saved complete results to: ${resultsPath}`);

    yield* logger.info("Evaluation done", {
      duration: metadata.totalDuration,
      completedEvals: completedEvals.length,
      failedEvals: failedEvals.length,
    });

    // Print diff stats and test suite results for visibility
    yield* logger.info("\n=== Git Diff Statistics & Scores ===");
    for (const r of instanceResults) {
      if (isCompleteInstanceResult(r)) {
        yield* logger.info(dedent`
          ${r.instanceId} [${r.agentName}]: ${r.diffStats.getNumFilesChanged()} files, ${r.diffStats.getNumLinesChanged()} lines, score: ${r.score}
          ${"testSuiteResult" in r ? `${r.testSuiteResult.name}: ${jsonStringify(r.testSuiteResult.summary)}` : ""}`);
      } else {
        yield* logger.info(
          `${r.instanceId} [${r.agentName}]: Eval didn't complete - ${r.cause}`,
        );
      }
    }
    yield* logger.info(`Total Score: ${totalScore}`);
    yield* logger.info("===========================\n");

    yield* logger.info("Update evaluation completed");
    return result;
  });
}

export function evaluate(
  benchmarkInfo: {
    benchmarkPath: string;
    initialPrompt: string;
    updatePrompt: string;
  },
  codingAgent: CodingAgent,
  config: EvaluationConfig,
): Effect.Effect<
  EvaluationResult,
  EvaluationError,
  FileSystem.FileSystem | CommandExecutor | LoggerConfig
> {
  const { benchmarkPath, initialPrompt, updatePrompt } = benchmarkInfo;
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    yield* logger.info("Starting full evaluation").pipe(
      Effect.annotateLogs({
        initialPrompt: initialPrompt.substring(0, 100),
        updatePrompt: updatePrompt.substring(0, 100),
      }),
    );

    const tempDir = yield* Effect.sync(() =>
      tmp.dirSync({
        prefix: "benchmark-",
        unsafeCleanup: true,
        keep: true,
      }),
    );

    yield* logger.debug(`Created temporary workspace: ${tempDir.name}`);

    const originalProgramPath = yield* generateOriginalProgram(
      initialPrompt,
      codingAgent,
      tempDir.name,
    );

    const updateResult = yield* evaluateUpdates(
      benchmarkPath,
      originalProgramPath,
      updatePrompt,
      tempDir.name,
      config,
    );

    yield* logger.info(`Benchmark results saved at: ${tempDir.name}`);

    return {
      ...updateResult,
      originalProgramSource: {
        type: "generatedInRun" as const,
        initialPrompt,
      },
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        const { logger } = yield* LoggerConfig;
        yield* logger.error("Full evaluation failed").pipe(
          Effect.annotateLogs({
            error: error instanceof Error ? error.message : String(error),
          }),
        );

        return yield* Effect.fail(
          error instanceof EvaluationError
            ? error
            : new EvaluationError(
                "Full evaluation failed",
                "EVALUATION_FAILED",
                error,
              ),
        );
      }),
    ),
  );
}

function generateOriginalProgram(
  initialPrompt: string,
  codingAgent: CodingAgent,
  workspaceDir: string,
): Effect.Effect<
  string,
  EvaluationError,
  FileSystem.FileSystem | CommandExecutor | LoggerConfig
> {
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    yield* logger.info("Generating original program");

    const originalFolder = path.join(workspaceDir, "original-program");
    const fs = yield* FileSystem.FileSystem;
    yield* fs.makeDirectory(originalFolder, { recursive: true });

    yield* codingAgent(initialPrompt, originalFolder).pipe(
      Effect.mapError(
        (error) =>
          new EvaluationError(
            "Failed to generate original program",
            "GENERATION_FAILED",
            error,
          ),
      ),
    );

    const files = yield* fs.readDirectory(originalFolder);
    if (files.length === 0) {
      return yield* Effect.fail(
        new EvaluationError(
          "Coding agent did not generate any files",
          "NO_FILES_GENERATED",
        ),
      );
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(originalFolder, ".gitignore");
    const gitignoreExists = yield* fs.exists(gitignorePath);
    if (!gitignoreExists) {
      const gitignoreContent = `node_modules/
.DS_Store
*.log
.env
package-lock.json
dist/
build/
`;
      yield* fs.writeFileString(gitignorePath, gitignoreContent);
    }

    // Initialize git repo and commit
    yield* gitCmd(originalFolder, "init");
    yield* gitCmd(originalFolder, "add", "-A");
    yield* gitCmd(
      originalFolder,
      "commit",
      "-m",
      "Initial commit: Generated program",
    );

    yield* logger.info("Original program generated and committed to git", {
      path: originalFolder,
      fileCount: files.length,
    });
    return originalFolder;
  }).pipe(
    Effect.mapError((error) =>
      error instanceof EvaluationError
        ? error
        : new EvaluationError(
            "Failed to generate original program",
            "GENERATION_FAILED",
            error,
          ),
    ),
  );
}

function applyUpdatesToInstances(
  benchmarkPath: string,
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig,
): Effect.Effect<
  InstanceResult[],
  PlatformError,
  FileSystem.FileSystem | CommandExecutor | LoggerConfig
> {
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;

    const agents: FeatureAgent[] = [new ClaudeAgent(), new CodexAgent()];
    // { name: 'gemini', agent: geminiAgent, applyUpdate: false }

    const basePort = 30000;
    const instances = yield* makeInstances(
      workspaceDir,
      basePort,
      agents,
      config,
    );

    yield* logger.info("Applying updates to all instances in parallel");

    return yield* Effect.forEach(
      instances,
      (instance) =>
        Effect.gen(function* () {
          const { logger } = yield* LoggerConfig;

          const fs = yield* FileSystem.FileSystem;
          yield* fs.copy(originalProgramPath, instance.instancePath);
          yield* logger.debug(`Created instance ${instance.instanceId}`);

          // 1. Try to update with feature addition agent
          const agentResult = yield* tryApplyUpdate(updatePrompt, instance);
          if (isFailedInstanceResult(agentResult)) {
            return agentResult;
          }

          // 2. Compute diff stats
          const diffStats = yield* computeDiffStats(agentResult);

          // 3. Commit the changes for future reference
          yield* gitCmd(
            agentResult.instancePath,
            "commit",
            "-m",
            `Update: Applied modifications by ${agentResult.agentName}`,
          );

          // 4. Run functionality tests
          const testResult = yield* runFunctionalityTests({
            benchmarkPath,
            systemUnderTestPath: agentResult.instancePath,
            port: instance.port,
          }).pipe(Effect.either);

          // If tests failed to run, return FailedInstanceResult with UpdateOnlyInstanceInfo
          if (Either.isLeft(testResult)) {
            yield* logger.error(
              `Could not run tests for ${instance.instanceId}`,
              { cause: testResult.left },
            );

            return makeFailedInstanceResult(
              instance,
              agentResult.executionTimeMs,
              jsonStringify(testResult.left),
              testResult.left._tag,
              makeUpdateOnlyInfo(
                agentResult.instanceId,
                agentResult.instancePath,
                agentResult.agentName,
                agentResult.executionTimeMs,
                diffStats,
              ),
            );
          }
          // Tests ran successfully, continue with scoring
          const testSuiteResult = testResult.right;

          // 5. Calculate score
          const MAX_POSSIBLE_SCORE = 300;
          const diffOnlyScore = Math.max(
            0,
            MAX_POSSIBLE_SCORE - diffStats.getNumLinesChanged(),
          );
          const score = allTestsPassed(testSuiteResult) ? diffOnlyScore : 0;

          // 7. Make final result
          const finalResult: CompleteInstanceResult = {
            ...agentResult,
            type: "CompleteInstanceResult",
            diffStats,
            testSuiteResult,
            score,
          };

          // 6. Log
          yield* logger.info(`Instance ${instance.instanceId} completed`);
          yield* logger.info(
            dedent`
              → ${finalResult.instanceId} [${finalResult.agentName}]: ${finalResult.diffStats.getNumFilesChanged()} files changed, ${finalResult.diffStats.getNumLinesChanged()} lines changed, score: ${finalResult.score}`,
          );

          return finalResult;
        }),
      { concurrency: "unbounded" },
    );
  });
}

function computeDiffStats(
  metadata: InstanceMetadata,
): Effect.Effect<DiffStats, PlatformError, CommandExecutor | LoggerConfig> {
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;

    // **************************************************
    // a. Add all changes to staging to see what changed
    // **************************************************
    yield* gitCmd(metadata.instancePath, "add", "-A");

    // **************************************************
    // b. Get the diff statistics
    // **************************************************
    const baseGitDiffArgs = [
      "diff",
      "--cached",
      "-M",
      // for heuristic rename detection
      "--ignore-space-change",
      // more conservative than --ignore-all-space (TODO: will need to monitor / tune this)
    ];
    const diffOutput = yield* gitCmd(metadata.instancePath, ...baseGitDiffArgs);

    const diffStatOutput = yield* Command.make("diffstat", "-tm").pipe(
      Command.feed(diffOutput),
      Command.string,
    );
    // diffstat with -m because we want to count, e.g., changing a word on a line as being one change, as opposed to two.
    // -t for easy parsing
    // IMPT: Do NOT use --unified=0 with the git diff command -- that breaks the diffstat parsing
    const diffStats = DiffStats.makeFromDiffstat(diffStatOutput);

    // **************************************************
    // c. Log the full diff stats for debugging
    // **************************************************
    const gitDiffStatOutput = yield* gitCmd(
      metadata.instancePath,
      ...baseGitDiffArgs,
      "--stat",
    );
    yield* logger.debug(dedent`
            Diff stats for ${metadata.instanceId}:
            ${gitDiffStatOutput}`);
    yield* logger.debug(dedent`
            ${baseGitDiffArgs.join(" ")} | diffstat -tm for ${metadata.instanceId}:
            ${diffStatOutput}`);

    return diffStats;
  });
}

// TODO: Consider doing more to improve resource cleanups (eg killing started processes at the end)
const tryApplyUpdate = (
  updatePrompt: string,
  instance: InstanceDescriptor,
): Effect.Effect<
  UpdateOnlyInstanceInfo | FailedInstanceResult,
  never,
  LoggerConfig
> =>
  Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    const startTime = yield* Effect.sync(() => Date.now());

    return yield* instance.agent.applyUpdate(updatePrompt, instance).pipe(
      Effect.matchCauseEffect({
        onFailure: (cause) =>
          Effect.gen(function* () {
            const elapsed = yield* Effect.sync(() => Date.now() - startTime);
            yield* logger.error(
              `Feature agent failed for ${instance.instanceId}`,
              {
                cause,
              },
            );

            return makeFailedInstanceResult(
              instance,
              elapsed,
              Cause.pretty(cause, { renderErrorCause: true }),
            );
          }),
        onSuccess: (metadata) => Effect.succeed(metadata),
      }),
    );
  });

export type { CodingAgent } from "../agents/types.ts";
export type { EvaluationConfig } from "./config.ts";
export type { EvaluationResult } from "./result.ts";
