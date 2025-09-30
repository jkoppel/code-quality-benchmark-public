import type { ClaudeAgentConfig } from "../agents/feature-addition/claude-agent.ts";

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
