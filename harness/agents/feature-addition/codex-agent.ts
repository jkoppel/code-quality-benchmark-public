import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createShellAgent } from "../shell-agent.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codexScriptPath = path.join(__dirname, "../../../agents/raw_codex.sh");

const baseCodexAgent = createShellAgent(codexScriptPath);

// biome-ignore lint/suspicious/useAwait: Returns Promise directly from async function
export const codexAgent = async (
  prompt: string,
  folderPath: string,
  port: number = 30000,
): Promise<void> => {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(prompt, folderPath, port)}`;
  return baseCodexAgent(fullPrompt, folderPath, port);
};
