import { spawn } from 'node:child_process';
import { Logger } from '../utils/logger';

/**
 * Creates a CodingAgent that executes a shell script with the prompt and folder path as arguments
 * @param scriptPath - Path to the shell script to execute
 * @param timeout - Optional timeout in milliseconds (default: 5 minutes)
 * @returns A CodingAgent function
 */
export function createShellAgent(
  scriptPath: string,
  timeout: number = 300000
): (prompt: string, folderPath: string, port?: number) => Promise<void> {
  const logger = Logger.getInstance();
  
  return async (prompt: string, folderPath: string, port: number = 30000): Promise<void> => {
    return new Promise((resolve, reject) => {
      logger.info('Executing shell script agent', {
        script: scriptPath,
        folder: folderPath,
        promptLength: prompt.length
      });

      // Spawn the shell script with prompt and folder path as arguments
      const child = spawn('bash', [scriptPath, prompt], {
        cwd: folderPath,
        env: {
          ...process.env,
          CODING_PROMPT: prompt,
          CODING_FOLDER: folderPath,
          PORT: String(port)
        },
        timeout
      });

      // TODO 2025.08.23: Use package that does all this for you, captures stdout and stderr.
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      child.on('error', (error) => {
        logger.error('Failed to execute shell script', {
          script: scriptPath,
          error: error.message
        });
        reject(new Error(`Failed to execute shell script: ${error.message}`));
      });

      child.on('close', (code, signal) => {
        if (code === 0) {
          logger.info('Shell script executed successfully', {
            script: scriptPath,
            folder: folderPath
          });
          resolve();
        } else {
          const errorMsg = code !== null 
            ? `Shell script exited with code ${code}.`
            : `Shell script was terminated by signal ${signal}.`;
          logger.error('Shell script failed', {
            script: scriptPath,
            code,
            signal,
          });
          reject(new Error(errorMsg));
        }
      });
    });
  };
}

/**
 * Default shell agent that expects a script at a standard location
 */
export const defaultShellAgent = createShellAgent('./coding-agent.sh');