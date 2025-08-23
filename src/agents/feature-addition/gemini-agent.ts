import * as path from 'path';
import { createShellAgent } from '../shell-agent';
import { SYSTEM_PROMPT, getFullPrompt } from './common-prompts';

const geminiScriptPath = path.join(__dirname, '../../../agents/raw_gemini.sh');

const baseGeminiAgent = createShellAgent(geminiScriptPath);

export const geminiAgent = async (prompt: string, folderPath: string, port: number = 30000): Promise<void> => {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(prompt, folderPath, port)}`;
  return baseGeminiAgent(fullPrompt, folderPath, port);
};