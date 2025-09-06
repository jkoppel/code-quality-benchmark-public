import { execSync } from "child_process";
import fs from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
import {
  type CodingAgent,
  eval as evaluate,
  evaluateUpdates,
} from "./index.js";

/**
 * Common benchmark output logic
 */
export function outputBenchmarkResults(
  benchmarkName: string,
  result: any,
): void {
  // Output benchmark results as JSON
  const successCount = result.updates.filter((u: any) => u.success).length;
  const totalUpdates = result.updates.length;

  // Calculate per-agent success rates
  const agentStats: {
    [key: string]: { successful: number; total: number; totalScore: number };
  } = {};
  result.updates.forEach((u: any) => {
    if (!agentStats[u.agentName]) {
      agentStats[u.agentName] = { successful: 0, total: 0, totalScore: 0 };
    }
    agentStats[u.agentName].total++;
    agentStats[u.agentName].totalScore += u.score;
    if (u.success) {
      agentStats[u.agentName].successful++;
    }
  });

  const updates = result.updates.map((u: any) => ({
    instance: u.instanceId,
    agent: u.agentName,
    success: u.success,
    score: u.score,
    diffStats: u.diffStats || { filesChanged: 0, insertions: 0, deletions: 0 },
    executionTime: u.executionTime,
  }));

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
export async function runBenchmarkWithNewCode(
  benchmarkPath: string,
  codingAgent: CodingAgent,
): Promise<void> {
  const benchmarkName = path.basename(benchmarkPath);
  const { initialPrompt, updatePrompt } =
    await readBenchmarkPrompts(benchmarkPath);

  if (!initialPrompt) {
    throw new Error(`Missing initial-prompt.txt in ${benchmarkPath}`);
  }

  // Run the evaluation
  const result = await evaluate(initialPrompt, codingAgent, updatePrompt, {
    logLevel: "info",
  });

  outputBenchmarkResults(benchmarkName, result);
}

/**
 * Run benchmark with existing initial code
 */
export async function runBenchmarkWithExistingCode(
  benchmarkPath: string,
  existingCodePath: string,
): Promise<void> {
  const benchmarkName = path.basename(benchmarkPath);
  const { updatePrompt } = await readBenchmarkPrompts(benchmarkPath);

  // Verify existing code has git repo
  try {
    execSync("git status", { cwd: existingCodePath, stdio: "ignore" });
  } catch (error) {
    throw new Error(
      `Existing code at ${existingCodePath} is not a git repository`,
    );
  }

  // Create temporary workspace - always keep it
  const tempDir = tmp.dirSync({
    prefix: `benchmark-existing-${benchmarkName}-`,
    unsafeCleanup: true,
    keep: true,
  });

  console.log(`Created temporary workspace: ${tempDir.name}`);

  // Copy existing code to temp dir as "original-program"
  const originalProgramPath = path.join(tempDir.name, "original-program");
  await fs.copy(existingCodePath, originalProgramPath);

  // Check if the destination directory is already a git repository
  try {
    execSync("git status", { cwd: originalProgramPath, stdio: "ignore" });
  } catch (error) {
    // Not a git repository, initialize it
    execSync("git init", { cwd: originalProgramPath });
    execSync("git add -A", { cwd: originalProgramPath });
    execSync('git commit -m "Initial commit: Generated program"', {
      cwd: originalProgramPath,
    });
  }

  // Run the update evaluation only
  const result = await evaluateUpdates(
    originalProgramPath,
    updatePrompt,
    tempDir.name,
    {
      logLevel: "info",
    },
  );

  outputBenchmarkResults(benchmarkName, result);

  console.log(`\nBenchmark results saved at: ${tempDir.name}`);
}
