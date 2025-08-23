import * as tmp from 'tmp';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  CodingAgent,
  EvaluationConfig,
  EvaluationResult,
  InstanceResult,
  EvaluationError,
  EvaluationMetadata
} from './types';
import { Logger } from './utils/logger';
import { ClaudeAgent } from './agents/claude-agent';

// Configure tmp to automatically cleanup
tmp.setGracefulCleanup();

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
    // Create temporary workspace
    tempDir = tmp.dirSync({ 
      prefix: 'benchmark-', 
      unsafeCleanup: true,
      keep: !config.cleanupAfterRun
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

    logger.info('Evaluation completed successfully', {
      duration: metadata.totalDuration,
      successfulUpdates: updateResults.filter(r => r.success).length,
      failedUpdates: updateResults.filter(r => !r.success).length
    });

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
    if (config.cleanupAfterRun && tempDir) {
      try {
        tempDir.removeCallback();
        logger.debug('Cleaned up temporary workspace');
      } catch (cleanupError) {
        logger.error('Failed to cleanup workspace', {
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        });
      }
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
    
    logger.info('Original program generated successfully', {
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
  
  // Create instance directories and copy original program
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
  
  results.forEach((result, index) => {
    logger.info(`Instance ${instances[index]} completed`, {
      success: result.success,
      executionTime: result.executionTime
    });
  });
  
  return results;
}

export { EvaluationConfig, EvaluationResult, CodingAgent } from './types';