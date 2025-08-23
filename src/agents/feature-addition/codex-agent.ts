import * as path from 'path';
import { createShellAgent } from '../shell-agent';
import { SYSTEM_PROMPT, getFullPrompt } from './common-prompts';

const codexScriptPath = path.join(__dirname, '../../../agents/raw_codex.sh');

const baseCodexAgent = createShellAgent(codexScriptPath);

export const codexAgent = async (prompt: string, folderPath: string, port: number = 30000): Promise<void> => {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(prompt, folderPath, port)}`;
  return baseCodexAgent(fullPrompt, folderPath, port);
};