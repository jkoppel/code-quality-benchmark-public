import * as tmp from 'tmp';
import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import {
  CodingAgent,
  EvaluationConfig,
  EvaluationResult,
  InstanceResult,
  DiffStats,
  EvaluationError,
  EvaluationMetadata
} from './types';
import { Logger } from './utils/logger';
import { ClaudeAgent } from './agents/claude-agent';

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
    deletions: 0
  };

  if (!output || output.trim() === '') {
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

export async function evaluate(
  initialPrompt: string,
  codingAgent: CodingAgent,
  updatePrompt: string,
  config: EvaluationConfig = {}
): Promise<EvaluationResult> {
  const startTime = new Date();
  const logger = Logger.getInstance(config.logLevel);

  logger.info('Starting evaluation', {
    initialPrompt: initialPrompt.substring(0, 100),
    updatePrompt: updatePrompt.substring(0, 100)
  });

  let tempDir: tmp.DirResult | null = null;
  let originalProgramPath: string = '';

  try {
    // Create temporary workspace - always keep it
    tempDir = tmp.dirSync({ 
      prefix: 'benchmark-', 
      unsafeCleanup: true,
      keep: true
    });

    logger.debug('Created temporary workspace', { path: tempDir.name });

    originalProgramPath = await generateOriginalProgram(
      initialPrompt,
      codingAgent,
      tempDir.name,
      logger
    );

    const updateResults = await applyUpdatesToInstances(
      originalProgramPath,
      updatePrompt,
      tempDir.name,
      config,
      logger
    );

    const endTime = new Date();
    const metadata: EvaluationMetadata = {
      startTime,
      endTime,
      totalDuration: endTime.getTime() - startTime.getTime(),
      agentUsed: 'claude-code',
      config
    };

    const result: EvaluationResult = {
      initialPrompt,
      updatePrompt,
      originalProgramPath,
      updates: updateResults,
      metadata
    };

    // Log diff stats
    const diffStats = updateResults.map(r => ({
      instance: r.instanceId,
      stats: r.diffStats || { filesChanged: 0, insertions: 0, deletions: 0 }
    }));
    
    logger.info('Evaluation completed successfully', {
      duration: metadata.totalDuration,
      successfulUpdates: updateResults.filter(r => r.success).length,
      failedUpdates: updateResults.filter(r => !r.success).length,
      diffStats
    });
    
    // Also print diff stats to console for visibility
    console.log('\n=== Git Diff Statistics ===');
    updateResults.forEach(r => {
      if (r.diffStats) {
        console.log(`${r.instanceId}: ${r.diffStats.filesChanged} files, +${r.diffStats.insertions}/-${r.diffStats.deletions} lines${r.success ? '' : ' (failed)'}`);
      } else {
        console.log(`${r.instanceId}: No changes${r.success ? '' : ' (failed)'}`);
      }
    });
    console.log('===========================\n');

    return result;

  } catch (error) {
    logger.error('Evaluation failed', {
      error: error instanceof Error ? error.message : String(error)
    });

    throw error instanceof EvaluationError 
      ? error 
      : new EvaluationError(
          'Evaluation failed',
          'EVALUATION_FAILED',
          error
        );
  } finally {
    // Never cleanup - we want to keep the results
    if (tempDir) {
      logger.info('Benchmark results saved at:', { path: tempDir.name });
    }
  }
}

async function generateOriginalProgram(
  initialPrompt: string,
  codingAgent: CodingAgent,
  workspaceDir: string,
  logger: Logger
): Promise<string> {
  logger.info('Generating original program');
  
  const originalFolder = path.join(workspaceDir, 'original-program');
  await fs.ensureDir(originalFolder);
  
  try {
    await codingAgent(initialPrompt, originalFolder);
    
    const files = await fs.readdir(originalFolder);
    if (files.length === 0) {
      throw new EvaluationError(
        'Coding agent did not generate any files',
        'NO_FILES_GENERATED'
      );
    }
    
    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(originalFolder, '.gitignore');
    if (!await fs.pathExists(gitignorePath)) {
      const gitignoreContent = `node_modules/
.DS_Store
*.log
.env
dist/
build/
`;
      await fs.writeFile(gitignorePath, gitignoreContent);
    }
    
    // Initialize git repo and commit
    execSync('git init', { cwd: originalFolder });
    execSync('git add -A', { cwd: originalFolder });
    execSync('git commit -m "Initial commit: Generated program"', { cwd: originalFolder });
    
    logger.info('Original program generated and committed to git', {
      path: originalFolder,
      fileCount: files.length
    });
    
    return originalFolder;
    
  } catch (error) {
    throw new EvaluationError(
      'Failed to generate original program',
      'GENERATION_FAILED',
      error
    );
  }
}

async function applyUpdatesToInstances(
  originalProgramPath: string,
  updatePrompt: string,
  workspaceDir: string,
  config: EvaluationConfig,
  logger: Logger
): Promise<InstanceResult[]> {
  const instances = ['instance-1', 'instance-2', 'instance-3'];
  const claudeAgent = new ClaudeAgent(config.claudeConfig, logger);
  
  logger.info('Creating program instances for updates');
  
  // Create instance directories and copy original program (including .git)
  const instancePaths: string[] = await Promise.all(
    instances.map(async (instanceId) => {
      const instancePath = path.join(workspaceDir, instanceId);
      await fs.copy(originalProgramPath, instancePath);
      logger.debug(`Created instance ${instanceId}`, { path: instancePath });
      return instancePath;
    })
  );
  
  logger.info('Applying updates to instances in parallel');
  
  // Always execute in parallel
  const updatePromises = instancePaths.map((instancePath, index) =>
    claudeAgent.applyUpdate(
      updatePrompt,
      instancePath,
      instances[index]
    )
  );
  
  const results = await Promise.all(updatePromises);
  
  // Calculate git diff statistics
  const resultsWithDiffs = results.map((result, index) => {
    const instancePath = instancePaths[index];
    let diffStats: DiffStats | undefined;
    
    if (result.success) {
      try {
        // First add all changes to staging to see what changed
        execSync('git add -A', { cwd: instancePath });
        
        // Get the diff statistics using --shortstat
        const shortstatOutput = execSync('git diff --cached --shortstat', { 
          cwd: instancePath,
          encoding: 'utf-8'
        });
        
        diffStats = parseGitShortstat(shortstatOutput);
        
        // Also log the full diff stats for debugging
        const fullStats = execSync('git diff --cached --stat', {
          cwd: instancePath,
          encoding: 'utf-8'
        });
        logger.debug(`Diff stats for ${instances[index]}:\n${fullStats}`);
        
        // Commit the changes for future reference
        try {
          execSync(`git commit -m "Update: Applied modifications"`, { cwd: instancePath });
        } catch (commitError) {
          // If commit fails (e.g., nothing to commit), that's okay
          logger.debug(`No changes to commit for ${instances[index]}`);
        }
      } catch (error) {
        logger.warn(`Failed to get git diff for ${instances[index]}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    const resultWithDiff: InstanceResult = {
      ...result,
      diffStats
    };
    
    logger.info(`Instance ${instances[index]} completed`, {
      success: result.success,
      executionTime: result.executionTime,
      diffStats
    });
    
    // Print diff stats to console immediately
    if (result.success && diffStats) {
      console.log(`  → ${instances[index]}: ${diffStats.filesChanged} files changed, +${diffStats.insertions}/-${diffStats.deletions} lines`);
    }
    
    return resultWithDiff;
  });
  
  return resultsWithDiffs;
}

export { EvaluationConfig, EvaluationResult, CodingAgent } from './types';