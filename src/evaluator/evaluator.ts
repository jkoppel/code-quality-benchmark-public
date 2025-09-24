import { execSync } from "node:child_process";
import * as path from "node:path";
import dedent from "dedent";
import fs from "fs-extra";
import * as tmp from "tmp";
import {
  ClaudeAgent,
  isClaudeAgent,
} from "../agents/feature-addition/claude-agent.ts";
import { codexAgent } from "../agents/feature-addition/codex-agent.ts";
import type { CodingAgent } from "../agents/types.ts";
import { getLoggerConfig, type Logger } from "../utils/logger/logger.ts";
import { DiffStats } from "./diff-stats.ts";
import {
  type EvaluationConfig,
  EvaluationError,
  type EvaluationMetadata,
  type EvaluationResult,
  type InstanceResult,
} from "./types.ts";

// import { geminiAgent } from './agents/feature-addition/gemini-agent.ts';

// Don't automatically cleanup - we want to keep benchmark results
// tmp.setGracefulCleanup();

/**
 * TODO
 * -----
 * - Should prob call functionality tests from e.g. the eval updates function and have the eval results include results from the functionality tests,
 * since functionality tests are, conceptually, themselves an eval.
 */

export async function evaluateUpdates(
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig = {},
): Promise<EvaluationResult> {
  const startTime = new Date();
  const { logger } = getLoggerConfig();

  logger
    .withMetadata({
      originalProgramPath,
      updatePrompt: updatePrompt.substring(0, 100),
    })
    .info("Starting update evaluation");

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
      (sum, result) => sum + result.result.score,
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
          totalDuration: Date.now() - startTime.getTime(),
          agentsUsed: ["claude-code", "codex"],
          config,
        },
      },
      { spaces: 2 },
    );

    logger
      .withMetadata({ path: resultsPath })
      .info("Saved complete results to:");

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
      stats:
        r.result.type === "invocationCompleted"
          ? r.result.diffStats
          : DiffStats.makeMempty(),
    }));

    logger
      .withMetadata({
        duration: metadata.totalDuration,
        successfulUpdates: updateResults.filter(
          (r) => r.result.type === "invocationCompleted",
        ).length,
        failedUpdates: updateResults.filter(
          (r) => r.result.type === "invocationFailed",
        ).length,
        diffStats,
      })
      .info("Evaluation completed successfully");

    // Also print diff stats to console for visibility
    console.log("\n=== Git Diff Statistics & Scores ===");
    updateResults.forEach((r) => {
      if (r.result.type === "invocationCompleted") {
        console.log(
          `${r.instanceId} [${r.agentName}]: ${r.result.diffStats.getNumFilesChanged()} files, ${r.result.diffStats.getNumLinesChanged()} lines, score: ${r.result.score}`,
        );
      } else {
        console.log(
          `${r.instanceId} [${r.agentName}]: Invocation failed, score: ${r.result.score}`,
        );
      }
    });
    console.log(`Total Score: ${totalScore}`);
    console.log("===========================\n");

    return result;
  } catch (error) {
    logger
      .withMetadata({
        error: error instanceof Error ? error.message : String(error),
      })
      .error("Evaluation failed");

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
  const { logger } = getLoggerConfig();

  logger
    .withMetadata({
      initialPrompt: initialPrompt.substring(0, 100),
      updatePrompt: updatePrompt.substring(0, 100),
    })
    .info("Starting full evaluation");

  let tempDir: tmp.DirResult | null = null;

  try {
    // Create temporary workspace - always keep it
    tempDir = tmp.dirSync({
      prefix: "benchmark-",
      unsafeCleanup: true,
      keep: true,
    });

    logger
      .withMetadata({ path: tempDir.name })
      .debug("Created temporary workspace");

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
    logger
      .withMetadata({
        error: error instanceof Error ? error.message : String(error),
      })
      .error("Full evaluation failed");

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
      logger
        .withMetadata({ path: tempDir.name })
        .info("Benchmark results saved at:");
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
    },
    { name: "codex", agent: codexAgent },
    // { name: 'gemini', agent: geminiAgent, applyUpdate: false }
  ];

  const instancesPerAgent = 3;
  const basePort = 30000;
  let currentPort = basePort;
  const allInstances: {
    instanceId: string;
    agentName: string;
    agent: unknown;
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
      logger
        .withMetadata({ path: instancePath })
        .debug(`Created instance ${instanceId}`);

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
  const updatePromises = allInstances.map(
    async (instance): Promise<InstanceResult> => {
      const startTime = Date.now();

      try {
        // For Claude, use its applyUpdate method, for others use the agent directly
        if (isClaudeAgent(instance.agent)) {
          return await instance.agent.applyUpdate(
            updatePrompt,
            instance.instancePath,
            instance.instanceId,
            instance.port,
          );
        } else {
          await (instance.agent as CodingAgent)(
            updatePrompt,
            instance.instancePath,
            instance.port,
          );
          // For other agents, create a success result manually
          return makeInvocationCompletedMempty(
            instance.instanceId,
            instance.instancePath,
            instance.agentName,
            Date.now() - startTime,
          );
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        logger
          .withMetadata({
            error: error.message,
          })
          .error(`Failed to apply update for ${instance.instanceId}`);

        return {
          instanceId: instance.instanceId,
          folderPath: instance.instancePath,
          agentName: instance.agentName,
          executionTimeMs: Date.now() - startTime,
          result: { type: "invocationFailed", score: 0, error },
        };
      }
    },
  );

  const results = await Promise.all(updatePromises);

  // Calculate git diff statistics and scores
  const resultsWithDiffs = results.map((result) => {
    const instancePath = result.folderPath;
    let diffStats = DiffStats.mempty();
    let score = 0;

    if (result.result.type === "invocationCompleted") {
      try {
        // First add all changes to staging to see what changed
        execSync("git add -A", { cwd: instancePath });

        // ***********************
        // Get the diff statistics
        // ***********************
        const baseGitDiffCmd = "git diff --cached -M --ignore-space-change";
        // -M for heuristic rename detection
        // --ignore-space-change, because more conservative than --ignore-all-space (TODO: will need to monitor / tune this)
        const diffThenDiffStat = `${baseGitDiffCmd} | diffstat -tm`;
        // diffstat with -m because we want to count, e.g., changing a word on a line as being one change, as opposed to two.
        // -t for easy parsing
        // IMPT: Do NOT use --unified=0 with the git diff command -- that breaks the diffstat parsing

        const diffStatOutput = execSync(diffThenDiffStat, {
          cwd: instancePath,
          encoding: "utf-8",
        });
        diffStats = DiffStats.makeFromDiffstat(diffStatOutput);

        // Calculate score: 300 - linesChanged
        score = Math.max(0, 300 - diffStats.getSummaryStats().linesChanged);

        // Also log the full diff stats for debugging
        const gitDiffStatOutput = execSync(`${baseGitDiffCmd} --stat`, {
          cwd: instancePath,
          encoding: "utf-8",
        });
        logger.debug(dedent`
                Diff stats for ${result.instanceId}:
                ${gitDiffStatOutput}`);
        logger.debug(dedent`
                ${diffThenDiffStat} for ${result.instanceId}: 
                ${diffStatOutput}`);

        // Commit the changes for future reference
        try {
          execSync(
            `git commit -m "Update: Applied modifications by ${result.agentName}"`,
            { cwd: instancePath },
          );
        } catch (_commitError) {
          // If commit fails (e.g., nothing to commit), that's okay
          logger.debug(`No changes to commit for ${result.instanceId}`);
        }
      } catch (error) {
        logger
          .withMetadata({
            error: error instanceof Error ? error.message : String(error),
          })
          .warn(`Failed to get git diff for ${result.instanceId}`);
      }
    }

    // Update score and diffStats for successful invocations
    const finalResult: InstanceResult =
      result.result.type === "invocationCompleted"
        ? {
            ...result,
            result: {
              type: "invocationCompleted",
              score,
              diffStats,
            },
          }
        : result;

    logger
      .withMetadata({
        success: result.result.type === "invocationCompleted",
        executionTime: result.executionTimeMs,
        diffStats,
        score,
        agentName: result.agentName,
      })
      .info(`Instance ${result.instanceId} completed`);

    // Log diff stats immediately
    if (result.result.type === "invocationCompleted") {
      logger.info(
        dedent`
          → ${result.instanceId} [${result.agentName}]: ${diffStats.getNumFilesChanged()} files changed, ${diffStats.getNumLinesChanged()} lines changed, score: ${score}`,
      );
    }

    return finalResult;
  });

  return resultsWithDiffs;
}

export type { CodingAgent } from "../agents/types.ts";
export type {
  EvaluationConfig,
  EvaluationResult,
} from "./types.ts";
