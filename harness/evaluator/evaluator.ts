import { execSync } from "node:child_process";
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
import { codexAgent } from "../agents/feature-addition/codex-agent.ts";
import type { CodingAgent } from "../agents/types.ts";
import { gitCmd } from "../utils/git.ts";
import { getLoggerConfig, type Logger } from "../utils/logger/logger.ts";
import type { EvaluationConfig, EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";
import { EvaluationError } from "./errors.ts";
import { type InstanceDescriptor, makeInstances } from "./instance.ts";
import {
  type AgentInvocationFailure,
  type EvaluationResult,
  getDiffStats,
  type InstanceResult,
  isInvocationFailure,
  isInvocationSuccess,
  makeAgentInvocationFailure,
  makeInstanceResult,
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
  config: EvaluationConfig = {},
) {
  const startTime = new Date();

  return Effect.gen(function* () {
    yield* Effect.logInfo("Starting update evaluation").pipe(
      Effect.annotateLogs({
        originalProgramPath,
        updatePrompt: updatePrompt.substring(0, 100),
      }),
    );

    const updateResults = yield* applyUpdatesToInstances(
      originalProgramPath,
      updatePrompt,
      workspaceDir,
      config,
    );
    const [successfulUpdates, failedUpdates] = [
      updateResults.filter(isInvocationSuccess),
      updateResults.filter(isInvocationFailure),
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
      agentsUsed: ["claude-code", "codex"],
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
    yield* Effect.logInfo(`Saved complete results to: ${resultsPath}`);

    // Log diff stats
    const diffStats = successfulUpdates.map((r) => ({
      instance: r.instanceId,
      stats: getDiffStats(r),
    }));

    yield* Effect.logInfo("Evaluation completed successfully").pipe(
      Effect.annotateLogs({
        duration: metadata.totalDuration,
        successfulUpdates: successfulUpdates.length,
        failedUpdates: failedUpdates.length,
        diffStats,
      }),
    );

    // Also print diff stats for visibility
    yield* Effect.log("\n=== Git Diff Statistics & Scores ===");
    for (const r of updateResults) {
      if (isInvocationSuccess(r)) {
        yield* Effect.log(
          `${r.instanceId} [${r.agentName}]: ${r.diffStats.getNumFilesChanged()} files, ${r.diffStats.getNumLinesChanged()} lines, score: ${r.score}`,
        );
      } else {
        yield* Effect.log(
          `${r.instanceId} [${r.agentName}]: Invocation failed - ${r.cause}`,
        );
      }
    }
    yield* Effect.log(`Total Score: ${totalScore}`);
    yield* Effect.log("===========================\n");

    yield* Effect.logInfo("Update evaluation completed");
    return result;
  });
}

export function evaluate(
  initialPrompt: string,
  codingAgent: CodingAgent,
  updatePrompt: string,
  config: EvaluationConfig = {},
): Effect.Effect<
  EvaluationResult,
  EvaluationError,
  FileSystem.FileSystem | CommandExecutor
> {
  return Effect.gen(function* () {
    yield* Effect.logInfo("Starting full evaluation").pipe(
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

    yield* Effect.logDebug(`Created temporary workspace: ${tempDir.name}`);

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

    yield* Effect.logInfo(`Benchmark results saved at: ${tempDir.name}`);

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
        yield* Effect.logError("Full evaluation failed").pipe(
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

async function generateOriginalProgram(
  initialPrompt: string,
  codingAgent: CodingAgent,
  workspaceDir: string,
  logger: Logger,
): Promise<string> {
  logger.info("Generating original program");

  const originalFolder = path.join(workspaceDir, "original-program");
  await runWithNodeFileSystem(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.makeDirectory(originalFolder, { recursive: true });
    }),
  );

  try {
    await codingAgent(initialPrompt, originalFolder);

    const files = yield* fs.readDirectory(originalFolder);
    if (files.length === 0) {
      throw new EvaluationError(
        "Coding agent did not generate any files",
        "NO_FILES_GENERATED",
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
    execSync("git init", { cwd: originalFolder });
    execSync("git add -A", { cwd: originalFolder });
    execSync('git commit -m "Initial commit: Generated program"', {
      cwd: originalFolder,
    });

    logger
      .withMetadata({
        path: originalFolder,
        fileCount: files.length,
      })
      .info("Original program generated and committed to git");

    return originalFolder;
  } catch (error) {
    throw new EvaluationError(
      "Failed to generate original program",
      "GENERATION_FAILED",
      error,
    );
  }
}

function applyUpdatesToInstances(
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig,
): Effect.Effect<
  (InstanceResult | AgentInvocationFailure)[],
  PlatformError,
  FileSystem.FileSystem | CommandExecutor
> {
  // Make instances
  const agents = [
    {
      name: "claude",
      agent: new ClaudeAgent(config.claudeConfig),
    },
    { name: "codex", agent: codexAgent },
    // { name: 'gemini', agent: geminiAgent, applyUpdate: false }
  ];

  const instancesPerAgent = 3;
  const basePort = 30000;
  const instances: readonly InstanceDescriptor[] = makeInstances(
    getLoggerConfig().logger,
    workspaceDir,
    basePort,
    instancesPerAgent,
    agents,
  );

  // Execute all updates in parallel
  Effect.logInfo("Applying updates to all instances in parallel");
  return Effect.forEach(
    instances,
    (instance) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.copy(originalProgramPath, instance.instancePath);
        yield* Effect.logDebug(`Created instance ${instance.instanceId}`);

        // 1. Try to update with feature addition agent
        let result = yield* runFeatureAgent(
          getLoggerConfig().logger,
          updatePrompt,
          instance,
        );

        // 2. Compute diff stats
        result = yield* augmentWithDiffStats(result);
        if (isInvocationFailure(result)) {
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
        yield* Effect.logInfo(`Instance ${instance.instanceId} completed`);
        if (isInvocationSuccess(result)) {
          yield* Effect.logInfo(
            dedent`
              → ${result.instanceId} [${result.agentName}]: ${result.diffStats.getNumFilesChanged()} files changed, ${result.diffStats.getNumLinesChanged()} lines changed, score: ${result.score}`,
            ),
          );
        }

        return result;
      }),
    { concurrency: "unbounded" },
  );
}

function augmentWithDiffStats(
  result: InstanceResult | AgentInvocationFailure,
): Effect.Effect<
  InstanceResult | AgentInvocationFailure,
  PlatformError,
  CommandExecutor
> {
  if (!isInvocationSuccess(result)) {
    return Effect.succeed(result);
  }

  return Effect.gen(function* () {
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
    yield* Effect.logDebug(dedent`
            Diff stats for ${result.instanceId}:
            ${gitDiffStatOutput}`);
    yield* Effect.logDebug(dedent`
            ${baseGitDiffArgs.join(" ")} | diffstat -tm for ${result.instanceId}: 
            ${diffStatOutput}`);

    return { ...result, diffStats };
  });
}

export type { CodingAgent } from "../agents/types.ts";
export type { EvaluationConfig } from "./config.ts";
export type { EvaluationResult } from "./result.ts";
