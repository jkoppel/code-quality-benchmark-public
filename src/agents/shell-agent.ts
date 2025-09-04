import { spawn } from 'node:child_process';
import { Logger } from '../utils/logger.js';

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
      let last_packet_looks_like_claude_code_success = false;  // TAG_CLAUDE_CODE_SUCCESS_ACTUALLY_IS_SIGTERM_FOR_SOME_REASON
      child.stdout.on('data', (data) => {
        process.stdout.write(data);

         // TAG_CLAUDE_CODE_SUCCESS_ACTUALLY_IS_SIGTERM_FOR_SOME_REASON
        if (data.toString().startsWith('{"type":"result","subtype":"success","is_error":false')) {
          last_packet_looks_like_claude_code_success = true;
        } else {
          last_packet_looks_like_claude_code_success = false;
        }
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
        let success = false;

        // TAG_CLAUDE_CODE_SUCCESS_ACTUALLY_IS_SIGTERM_FOR_SOME_REASON
        if (signal === 'SIGTERM' && scriptPath.endsWith('raw_claude_code.sh') && last_packet_looks_like_claude_code_success) {
          success = true;
        } else if (code === 0) {
          success = true;
        }

        if (success) {
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