import { execSync } from "node:child_process";
import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import { Effect } from "effect";
import fs from "fs-extra";
import * as tmp from "tmp";
import type { CodingAgent } from "./agents/types.ts";
import {
  type EvaluationResult,
  type FailedInstanceResult,
  getDiffStats,
  isSuccessInstanceResult,
  type SuccessInstanceResult,
} from "./evaluator/result.ts";
import { eval as evaluate, evaluateUpdates } from "./index.ts";

/**
 * Common benchmark output logic
 */
export function outputBenchmarkResults(
  benchmarkName: string,
  result: EvaluationResult,
): void {
  // Output benchmark results as JSON
  const successCount = result.updates.filter(isSuccessInstanceResult).length;
  const totalUpdates = result.updates.length;

  // Calculate per-agent success rates
  const agentStats: {
    [key: string]: { successful: number; total: number; totalScore: number };
  } = {};
  result.updates.forEach((u: SuccessInstanceResult | FailedInstanceResult) => {
    if (!agentStats[u.agentName]) {
      agentStats[u.agentName] = { successful: 0, total: 0, totalScore: 0 };
    }
    agentStats[u.agentName].total++;
    agentStats[u.agentName].totalScore += u.score;
    if (isSuccessInstanceResult(u)) {
      agentStats[u.agentName].successful++;
    }
  });

  const updates = result.updates.map(
    (u: SuccessInstanceResult | FailedInstanceResult) => ({
      instance: u.instanceId,
      agent: u.agentName,
      success: isSuccessInstanceResult(u),
      score: u.score,
      diffStats: getDiffStats(u)?.getSummaryStats() ?? {
        filesChanged: 0,
        linesChanged: 0,
      },
      executionTime: u.executionTimeMs,
    }),
  );

  console.log(
    JSON.stringify(
      {
        benchmark: benchmarkName,
        workspacePath: result.originalProgramPath.replace(
          "/original-program",
          "",
        ),
        resultsFile: path.join(
          result.originalProgramPath.replace("/original-program", ""),
          "evaluation-results.json",
        ),
        total_score: result.totalScore,
        success_rate: (successCount / totalUpdates) * 100,
        successful_updates: successCount,
        total_updates: totalUpdates,
        duration_ms: result.metadata.totalDuration,
        agent_stats: Object.entries(agentStats).map(([agent, stats]) => ({
          agent,
          success_rate: (stats.successful / stats.total) * 100,
          successful: stats.successful,
          total: stats.total,
          total_score: stats.totalScore,
        })),
        updates,
      },
      null,
      2,
    ),
  );

  // Exit with appropriate code (success if all updates succeeded)
  process.exit(successCount === totalUpdates ? 0 : 1);
}

/**
 * Read benchmark prompts from files
 */
export async function readBenchmarkPrompts(
  benchmarkPath: string,
): Promise<{ initialPrompt?: string; updatePrompt: string }> {
  const initialPromptPath = path.join(benchmarkPath, "initial-prompt.txt");
  const updatePromptPath = path.join(benchmarkPath, "update-prompt.txt");

  // Update prompt is always required
  if (!(await fs.pathExists(updatePromptPath))) {
    throw new Error(`Missing update-prompt.txt in ${benchmarkPath}`);
  }
  const updatePrompt = await fs.readFile(updatePromptPath, "utf-8");

  // Initial prompt is optional (not needed for existing code)
  let initialPrompt: string | undefined;
  if (await fs.pathExists(initialPromptPath)) {
    initialPrompt = await fs.readFile(initialPromptPath, "utf-8");
  }

  return {
    initialPrompt: initialPrompt?.trim(),
    updatePrompt: updatePrompt.trim(),
  };
}

/**
 * Run benchmark with generated initial code
 */
export function runBenchmarkWithNewCode(
  benchmarkPath: string,
  codingAgent: CodingAgent,
): Effect.Effect<
  void,
  PlatformError | Error,
  FileSystem.FileSystem | CommandExecutor
> {
  return Effect.gen(function* () {
    const benchmarkName = path.basename(benchmarkPath);
    const { initialPrompt, updatePrompt } = yield* Effect.promise(() =>
      readBenchmarkPrompts(benchmarkPath),
    );

    if (!initialPrompt) {
      throw new Error(`Missing initial-prompt.txt in ${benchmarkPath}`);
    }

    const result = yield* evaluate(initialPrompt, codingAgent, updatePrompt, {
      logLevel: "info",
    });

    yield* Effect.sync(() => outputBenchmarkResults(benchmarkName, result));
  });
}

/**
 * Run benchmark with existing initial code
 */
export function runBenchmarkWithExistingCode(
  benchmarkPath: string,
  existingCodePath: string,
): Effect.Effect<
  void,
  PlatformError | Error,
  FileSystem.FileSystem | CommandExecutor
> {
  return Effect.gen(function* () {
    const benchmarkName = path.basename(benchmarkPath);
    const { updatePrompt } = yield* Effect.promise(() =>
      readBenchmarkPrompts(benchmarkPath),
    );

    // Verify existing code has git repo
    yield* Effect.try({
      try: () =>
        execSync("git status", { cwd: existingCodePath, stdio: "ignore" }),
      catch: (_error) =>
        new Error(
          `Existing code at ${existingCodePath} is not a git repository`,
        ),
    });

    // Create temporary workspace - always keep it
    const tempDir = yield* Effect.sync(() =>
      tmp.dirSync({
        prefix: `benchmark-existing-${benchmarkName}-`,
        unsafeCleanup: true,
        keep: true,
      }),
    );

    yield* Effect.log(`Created temporary workspace: ${tempDir.name}`);

    // Copy existing code to temp dir as "original-program"
    const originalProgramPath = path.join(tempDir.name, "original-program");
    const fs = yield* FileSystem.FileSystem;
    yield* fs.copy(existingCodePath, originalProgramPath);

    // Check if the destination directory is already a git repository
    yield* Effect.try({
      try: () =>
        execSync("git status", { cwd: originalProgramPath, stdio: "ignore" }),
      catch: (_error) =>
        Effect.sync(() => {
          // Not a git repository, initialize it
          execSync("git init", { cwd: originalProgramPath });
          execSync("git add -A", { cwd: originalProgramPath });
          execSync('git commit -m "Initial commit: Generated program"', {
            cwd: originalProgramPath,
          });
        }),
    }).pipe(Effect.catchAll(() => Effect.void));

    // Run the update evaluation only
    const result = yield* evaluateUpdates(
      originalProgramPath,
      updatePrompt,
      tempDir.name,
      {
        logLevel: "info",
      },
    );

    yield* Effect.sync(() => outputBenchmarkResults(benchmarkName, result));
    yield* Effect.log(`\nBenchmark results saved at: ${tempDir.name}`);
  });
}
