import type { Options } from "@anthropic-ai/claude-code";

export type CodingAgent = (
  prompt: string,
  folderPath: string,
  port?: number,
) => Promise<void>;

export type ClaudeAgentConfig = Pick<
  Options,
  "allowedTools" | "appendSystemPrompt" | "model"
>;

export class AgentExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string = "AGENT_EXECUTION_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AgentExecutionError";
  }
}
