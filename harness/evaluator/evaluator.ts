import * as path from "node:path";
import { Command, FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import dedent from "dedent";
import { Cause, Effect } from "effect";
import * as tmp from "tmp";
import {
  ClaudeAgent,
  isClaudeAgent,
} from "../agents/feature-addition/claude-agent.ts";
import { CodexAgent } from "../agents/feature-addition/codex-agent.ts";
import type { CodingAgent, FeatureAgent } from "../agents/types.ts";
import { gitCmd } from "../utils/git.ts";
import { LoggerConfig } from "../utils/logger/logger.ts";
import type { EvaluationConfig, EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";
import { EvaluationError } from "./errors.ts";
import { type InstanceDescriptor, makeInstances } from "./instance.ts";
import {
  type EvaluationResult,
  type FailedInstanceResult,
  getDiffStats,
  isFailedInstanceResult,
  isSuccessInstanceResult,
  makeFailedInstanceResult,
  makeSuccessInstanceResult,
  type SuccessInstanceResult,
} from "./result.ts";

// import { geminiAgent } from './agents/feature-addition/gemini-agent.ts';

// Don't automatically cleanup - we want to keep benchmark results
// tmp.setGracefulCleanup();

/**
 * TODO
 * -----
 * - Should prob call functionality tests from e.g. the eval updates function and have the eval results include results from the functionality tests,
 * since functionality tests are, conceptually, themselves an eval.
 */

export function evaluateUpdates(
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

    const updateResults = yield* applyUpdatesToInstances(
      originalProgramPath,
      updatePrompt,
      workspaceDir,
      config,
    );
    const [successfulUpdates, failedUpdates] = [
      updateResults.filter(isSuccessInstanceResult),
      updateResults.filter(isFailedInstanceResult),
    ];

    // Calculate total score
    const totalScore = successfulUpdates.reduce(
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
      updates: updateResults,
      metadata,
      totalScore,
    };

    // Save complete results to JSON
    const resultsPath = path.join(workspaceDir, "evaluation-results.json");

    const fs = yield* FileSystem.FileSystem;
    yield* fs.writeFileString(resultsPath, JSON.stringify(result, null, 2));
    yield* logger.info(`Saved complete results to: ${resultsPath}`);

    // Log diff stats
    const diffStats = successfulUpdates.map((r) => ({
      instance: r.instanceId,
      stats: getDiffStats(r),
    }));

    yield* logger.info("Evaluation completed successfully", {
      duration: metadata.totalDuration,
      successfulUpdates: successfulUpdates.length,
      failedUpdates: failedUpdates.length,
      diffStats,
    });

    // Also print diff stats for visibility
    yield* logger.info("\n=== Git Diff Statistics & Scores ===");
    for (const r of updateResults) {
      if (isSuccessInstanceResult(r)) {
        yield* logger.info(
          `${r.instanceId} [${r.agentName}]: ${r.diffStats.getNumFilesChanged()} files, ${r.diffStats.getNumLinesChanged()} lines, score: ${r.score}`,
        );
      } else {
        yield* logger.info(
          `${r.instanceId} [${r.agentName}]: Invocation failed - ${r.cause}`,
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
  initialPrompt: string,
  codingAgent: CodingAgent,
  updatePrompt: string,
  config: EvaluationConfig,
): Effect.Effect<
  EvaluationResult,
  EvaluationError,
  FileSystem.FileSystem | CommandExecutor | LoggerConfig
> {
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
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig,
): Effect.Effect<
  (SuccessInstanceResult | FailedInstanceResult)[],
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
          let result = yield* runFeatureAgent(updatePrompt, instance);

          // 2. Compute diff stats
          result = yield* augmentWithDiffStats(result);
          if (isFailedInstanceResult(result)) {
            return result;
          }

          // 3. Calculate score: 300 - linesChanged
          result.score = Math.max(
            0,
            300 - result.diffStats.getSummaryStats().linesChanged,
          );

          // 4. Commit the changes for future reference
          yield* gitCmd(
            result.folderPath,
            "commit",
            "-m",
            `Update: Applied modifications by ${result.agentName}`,
          );

          // 5. Log
          yield* logger.info(`Instance ${instance.instanceId} completed`);
          if (isSuccessInstanceResult(result)) {
            yield* logger.info(
              dedent`
                → ${result.instanceId} [${result.agentName}]: ${result.diffStats.getNumFilesChanged()} files changed, ${result.diffStats.getNumLinesChanged()} lines changed, score: ${result.score}`,
            );
          }

          return result;
        }),
      { concurrency: "unbounded" },
    );
  });
}

function augmentWithDiffStats(
  result: SuccessInstanceResult | FailedInstanceResult,
): Effect.Effect<
  SuccessInstanceResult | FailedInstanceResult,
  PlatformError,
  CommandExecutor | LoggerConfig
> {
  if (!isSuccessInstanceResult(result)) {
    return Effect.succeed(result);
  }

  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;

    // **************************************************
    // a. Add all changes to staging to see what changed
    // **************************************************
    yield* gitCmd(result.folderPath, "add", "-A");

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
    const diffOutput = yield* gitCmd(result.folderPath, ...baseGitDiffArgs);

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
      result.folderPath,
      ...baseGitDiffArgs,
      "--stat",
    );
    yield* logger.debug(dedent`
            Diff stats for ${result.instanceId}:
            ${gitDiffStatOutput}`);
    yield* logger.debug(dedent`
            ${baseGitDiffArgs.join(" ")} | diffstat -tm for ${result.instanceId}:
            ${diffStatOutput}`);

    return { ...result, diffStats };
  });
}

const runFeatureAgent = (
  updatePrompt: string,
  descriptor: InstanceDescriptor,
): Effect.Effect<
  SuccessInstanceResult | FailedInstanceResult,
  never,
  LoggerConfig
> =>
  Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    const startTime = yield* Effect.sync(() => Date.now());
    if (isClaudeAgent(descriptor.agent)) {
      return yield* descriptor.agent
        .applyUpdate(
          updatePrompt,
          descriptor.instancePath,
          descriptor.instanceId,
          descriptor.port,
        )
        .pipe(
          Effect.matchCauseEffect({
            onFailure: (cause) =>
              Effect.gen(function* () {
                const elapsed = yield* Effect.sync(
                  () => Date.now() - startTime,
                );
                const prettyCause = Cause.pretty(cause);
                yield* logger.error(
                  `Claude agent failed for ${descriptor.instanceId}`,
                  { cause: prettyCause },
                );

                return makeFailedInstanceResult(
                  descriptor.instanceId,
                  descriptor.instancePath,
                  descriptor.agentName,
                  elapsed,
                  prettyCause,
                );
              }),
            onSuccess: (success) => Effect.succeed(success),
          }),
        );
    }

    return yield* (descriptor.agent as CodingAgent)(
      updatePrompt,
      descriptor.instancePath,
      descriptor.port,
    ).pipe(
      Effect.map(() =>
        makeSuccessInstanceResult(
          descriptor.instanceId,
          descriptor.instancePath,
          descriptor.agentName,
          Date.now() - startTime,
        ),
      ),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          const elapsed = yield* Effect.sync(() => Date.now() - startTime);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          yield* logger.error(
            `Failed to apply update for ${descriptor.instanceId}`,
            { error: errorMessage },
          );
          return makeFailedInstanceResult(
            descriptor.instanceId,
            descriptor.instancePath,
            descriptor.agentName,
            elapsed,
            errorMessage,
          );
        }),
      ),
    );
  });

export type { CodingAgent } from "../agents/types.ts";
export type { EvaluationConfig } from "./config.ts";
export type { EvaluationResult } from "./result.ts";
