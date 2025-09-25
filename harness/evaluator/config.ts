import type { ClaudeAgentConfig } from "../agents/types.ts";

export interface EvaluationConfig {
  workspaceRoot?: string;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
  claudeConfig?: ClaudeAgentConfig;
}

export interface EvaluationMetadata {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  agentsUsed: string[];
  config: EvaluationConfig;
}
