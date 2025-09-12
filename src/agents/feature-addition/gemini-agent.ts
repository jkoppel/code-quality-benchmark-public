import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createShellAgent } from "../shell-agent.js";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const geminiScriptPath = path.join(__dirname, "../../../agents/raw_gemini.sh");

const baseGeminiAgent = createShellAgent(geminiScriptPath);

// biome-ignore lint/suspicious/useAwait: Returns Promise directly from async function
export const geminiAgent = async (
  prompt: string,
  folderPath: string,
  port: number = 30000,
): Promise<void> => {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(prompt, folderPath, port)}`;
  return baseGeminiAgent(fullPrompt, folderPath, port);
};
