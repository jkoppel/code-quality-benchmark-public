import { execSync } from "child_process";
import fs from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
import { ClaudeAgent } from "./agents/feature-addition/claude-agent.js";
import { codexAgent } from "./agents/feature-addition/codex-agent.js";
import {
  type CodingAgent,
  type DiffStats,
  type EvaluationConfig,
  EvaluationError,
  type EvaluationMetadata,
  type EvaluationResult,
  type InstanceResult,
} from "./types.js";
import { Logger } from "./utils/logger.js";

// import { geminiAgent } from './agents/feature-addition/gemini-agent.js';

// Don't automatically cleanup - we want to keep benchmark results
// tmp.setGracefulCleanup();

/**
 * Parse git diff --shortstat output
 * Example: " 4 files changed, 108 insertions(+), 24 deletions(-)"
 */
function parseGitShortstat(output: string): DiffStats {
  const stats: DiffStats = {
    filesChanged: 0,
    insertions: 0,
    deletions: 0,
  };

  if (!output || output.trim() === "") {
    return stats;
  }

  // Parse files changed
  const filesMatch = output.match(/(\d+) files? changed/);
  if (filesMatch) {
    stats.filesChanged = parseInt(filesMatch[1], 10);
  }

  // Parse insertions
  const insertionsMatch = output.match(/(\d+) insertions?\(\+\)/);
  if (insertionsMatch) {
    stats.insertions = parseInt(insertionsMatch[1], 10);
  }

  // Parse deletions
  const deletionsMatch = output.match(/(\d+) deletions?\(-\)/);
  if (deletionsMatch) {
    stats.deletions = parseInt(deletionsMatch[1], 10);
  }

  return stats;
}

export async function evaluateUpdates(
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig = {},
): Promise<EvaluationResult> {
  const startTime = new Date();
  const logger = Logger.getInstance(config.logLevel);

  logger.infoWith({
    originalProgramPath,
    updatePrompt: updatePrompt.substring(0, 100),
  }, "Starting update evaluation");

  try {
    const updateResults = await applyUpdatesToInstances(
      originalProgramPath,
      updatePrompt,
      workspaceDir,
      config,
      logger,
    );

    // Calculate total score
    const totalScore = updateResults.reduce(
      (sum, result) => sum + result.score,
      0,
    );

    // Save complete results to JSON
    const resultsPath = path.join(workspaceDir, "evaluation-results.json");
    await fs.writeJson(
      resultsPath,
      {
        updatePrompt,
        originalProgramPath,
        updates: updateResults,
        totalScore,
        metadata: {
          startTime,
          endTime: new Date(),
          totalDuration: new Date().getTime() - startTime.getTime(),
          agentsUsed: ["claude-code", "codex"],
          config,
        },
      },
      { spaces: 2 },
    );

    logger.infoWith({ path: resultsPath }, "Saved complete results to:");

    const endTime = new Date();
    const metadata: EvaluationMetadata = {
      startTime,
      endTime,
      totalDuration: endTime.getTime() - startTime.getTime(),
      agentsUsed: ["claude-code", "codex"],
      config,
    };

    const result: EvaluationResult = {
      initialPrompt: "", // Not applicable for update-only evaluation
      updatePrompt,
      originalProgramPath,
      updates: updateResults,
      metadata,
      totalScore,
    };

    // Log diff stats
    const diffStats = updateResults.map((r) => ({
      instance: r.instanceId,
      stats: r.diffStats || { filesChanged: 0, insertions: 0, deletions: 0 },
    }));

    logger.infoWith({
      duration: metadata.totalDuration,
      successfulUpdates: updateResults.filter((r) => r.success).length,
      failedUpdates: updateResults.filter((r) => !r.success).length,
      diffStats,
    }, "Evaluation completed successfully");

    // Also print diff stats to console for visibility
    console.log("\n=== Git Diff Statistics & Scores ===");
    updateResults.forEach((r) => {
      if (r.diffStats) {
        console.log(
          `${r.instanceId} [${r.agentName}]: ${r.diffStats.filesChanged} files, +${r.diffStats.insertions}/-${r.diffStats.deletions} lines, score: ${r.score}${r.success ? "" : " (failed)"}`,
        );
      } else {
        console.log(
          `${r.instanceId} [${r.agentName}]: No changes, score: ${r.score}${r.success ? "" : " (failed)"}`,
        );
      }
    });
    console.log(`Total Score: ${totalScore}`);
    console.log("===========================\n");

    return result;
  } catch (error) {
    logger.errorWith({
      error: error instanceof Error ? error.message : String(error),
    }, "Evaluation failed");

    throw error instanceof EvaluationError
      ? error
      : new EvaluationError("Evaluation failed", "EVALUATION_FAILED", error);
  } finally {
    logger.info("Update evaluation completed");
  }
}

export async function evaluate(
  initialPrompt: string,
  codingAgent: CodingAgent,
  updatePrompt: string,
  config: EvaluationConfig = {},
): Promise<EvaluationResult> {
  const logger = Logger.getInstance(config.logLevel);

  logger.infoWith({
    initialPrompt: initialPrompt.substring(0, 100),
    updatePrompt: updatePrompt.substring(0, 100),
  }, "Starting full evaluation");

  let tempDir: tmp.DirResult | null = null;

  try {
    // Create temporary workspace - always keep it
    tempDir = tmp.dirSync({
      prefix: "benchmark-",
      unsafeCleanup: true,
      keep: true,
    });

    logger.debugWith({ path: tempDir.name }, "Created temporary workspace");

    const originalProgramPath = await generateOriginalProgram(
      initialPrompt,
      codingAgent,
      tempDir.name,
      logger,
    );

    // Now run the update evaluation
    const result = await evaluateUpdates(
      originalProgramPath,
      updatePrompt,
      tempDir.name,
      config,
    );

    // Set the initial prompt in the result
    result.initialPrompt = initialPrompt;

    return result;
  } catch (error) {
    logger.errorWith({
      error: error instanceof Error ? error.message : String(error),
    }, "Full evaluation failed");

    throw error instanceof EvaluationError
      ? error
      : new EvaluationError(
          "Full evaluation failed",
          "EVALUATION_FAILED",
          error,
        );
  } finally {
    // Never cleanup - we want to keep the results
    if (tempDir) {
      logger.infoWith({ path: tempDir.name }, "Benchmark results saved at:");
    }
  }
}

async function generateOriginalProgram(
  initialPrompt: string,
  codingAgent: CodingAgent,
  workspaceDir: string,
  logger: Logger,
): Promise<string> {
  logger.info("Generating original program");

  const originalFolder = path.join(workspaceDir, "original-program");
  await fs.ensureDir(originalFolder);

  try {
    await codingAgent(initialPrompt, originalFolder);

    const files = await fs.readdir(originalFolder);
    if (files.length === 0) {
      throw new EvaluationError(
        "Coding agent did not generate any files",
        "NO_FILES_GENERATED",
      );
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(originalFolder, ".gitignore");
    if (!(await fs.pathExists(gitignorePath))) {
      const gitignoreContent = `node_modules/
.DS_Store
*.log
.env
package-lock.json
dist/
build/
`;
      await fs.writeFile(gitignorePath, gitignoreContent);
    }

    // Initialize git repo and commit
    execSync("git init", { cwd: originalFolder });
    execSync("git add -A", { cwd: originalFolder });
    execSync('git commit -m "Initial commit: Generated program"', {
      cwd: originalFolder,
    });

    logger.infoWith({
      path: originalFolder,
      fileCount: files.length,
    }, "Original program generated and committed to git");

    return originalFolder;
  } catch (error) {
    throw new EvaluationError(
      "Failed to generate original program",
      "GENERATION_FAILED",
      error,
    );
  }
}

async function applyUpdatesToInstances(
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig,
  logger: Logger,
): Promise<InstanceResult[]> {
  // Define agents and their configurations
  const agents = [
    {
      name: "claude",
      agent: new ClaudeAgent(config.claudeConfig, logger),
      applyUpdate: true,
    },
    { name: "codex", agent: codexAgent, applyUpdate: false },
    // { name: 'gemini', agent: geminiAgent, applyUpdate: false }
  ];

  const instancesPerAgent = 3;
  const basePort = 30000;
  let currentPort = basePort;
  const allInstances: {
    instanceId: string;
    agentName: string;
    agent: any;
    instancePath: string;
    port: number;
  }[] = [];

  logger.info("Creating program instances for updates");

  // Create instance directories for all agents
  for (const agentConfig of agents) {
    for (let i = 1; i <= instancesPerAgent; i++) {
      const instanceId = `${agentConfig.name}-${i}`;
      const instancePath = path.join(workspaceDir, instanceId);
      await fs.copy(originalProgramPath, instancePath);
      logger.debugWith({ path: instancePath }, `Created instance ${instanceId}`);

      allInstances.push({
        instanceId,
        agentName: agentConfig.name,
        agent: agentConfig.agent,
        instancePath,
        port: currentPort++,
      });
    }
  }

  logger.info("Applying updates to all instances in parallel");

  // Execute all updates in parallel
  const updatePromises = allInstances.map(async (instance) => {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;

    try {
      // For Claude, use its applyUpdate method, for others use the agent directly
      if (instance.agentName === "claude") {
        const result = await instance.agent.applyUpdate(
          updatePrompt,
          instance.instancePath,
          instance.instanceId,
          instance.port,
        );
        success = result.success;
        error = result.error;
      } else {
        await instance.agent(
          updatePrompt,
          instance.instancePath,
          instance.port,
        );
        success = true;
      }
    } catch (e) {
      success = false;
      error = e instanceof Error ? e : new Error(String(e));
      logger.errorWith({
        error: error.message,
      }, `Failed to apply update for ${instance.instanceId}`);
    }

    const executionTime = Date.now() - startTime;

    return {
      instanceId: instance.instanceId,
      folderPath: instance.instancePath,
      success,
      error,
      executionTime,
      agentName: instance.agentName,
      score: 0, // Will be calculated later
    };
  });

  const results = await Promise.all(updatePromises);

  // Calculate git diff statistics and scores
  const resultsWithDiffs = results.map((result) => {
    const instancePath = result.folderPath;
    let diffStats: DiffStats | undefined;
    let score = 0;

    if (result.success) {
      try {
        // First add all changes to staging to see what changed
        execSync("git add -A", { cwd: instancePath });

        // Get the diff statistics using --shortstat
        const shortstatOutput = execSync("git diff --cached --shortstat", {
          cwd: instancePath,
          encoding: "utf-8",
        });

        diffStats = parseGitShortstat(shortstatOutput);

        // Calculate score: 300 - insertions - deletions
        score = Math.max(0, 300 - (diffStats.insertions + diffStats.deletions));

        // Also log the full diff stats for debugging
        const fullStats = execSync("git diff --cached --stat", {
          cwd: instancePath,
          encoding: "utf-8",
        });
        logger.debug(`Diff stats for ${result.instanceId}:\n${fullStats}`);

        // Commit the changes for future reference
        try {
          execSync(
            `git commit -m "Update: Applied modifications by ${result.agentName}"`,
            { cwd: instancePath },
          );
        } catch (commitError) {
          // If commit fails (e.g., nothing to commit), that's okay
          logger.debug(`No changes to commit for ${result.instanceId}`);
        }
      } catch (error) {
        logger.warnWith({
          error: error instanceof Error ? error.message : String(error),
        }, `Failed to get git diff for ${result.instanceId}`);
      }
    }

    const resultWithDiff: InstanceResult = {
      ...result,
      diffStats,
      score,
    };

    logger.infoWith({
      success: result.success,
      executionTime: result.executionTime,
      diffStats,
      score,
      agentName: result.agentName,
    }, `Instance ${result.instanceId} completed`);

    // Print diff stats to console immediately
    if (result.success && diffStats) {
      console.log(
        `  → ${result.instanceId} [${result.agentName}]: ${diffStats.filesChanged} files changed, +${diffStats.insertions}/-${diffStats.deletions} lines, score: ${score}`,
      );
    }

    return resultWithDiff;
  });

  return resultsWithDiffs;
}

export { CodingAgent, EvaluationConfig, EvaluationResult } from "./types.js";
