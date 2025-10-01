import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Effect } from "effect";
import type { LoggerConfig } from "../../utils/logger/logger.ts";
import { createShellAgent } from "../shell-agent.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const geminiScriptPath = path.join(__dirname, "../../../agents/raw_gemini.sh");

const baseGeminiAgent = createShellAgent(geminiScriptPath);

export const geminiAgent = (
  prompt: string,
  folderPath: string,
  port: number = 30000,
): Effect.Effect<void, Error, LoggerConfig> => {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(prompt, folderPath, port)}`;
  return baseGeminiAgent(fullPrompt, folderPath, port);
};
