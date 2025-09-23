import type { Options } from "@anthropic-ai/claude-code";
import type { DiffStats } from "./evaluator/diff-stats.ts";

export type CodingAgent = (
  prompt: string,
  folderPath: string,
  port?: number,
) => Promise<void>;

export interface EvaluationConfig {
  workspaceRoot?: string;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
  claudeConfig?: ClaudeAgentConfig;
}

export type ClaudeAgentConfig = Pick<
  Options,
  "allowedTools" | "appendSystemPrompt" | "model"
>;

export interface EvaluationResult {
  initialPrompt: string;
  updatePrompt: string;
  originalProgramPath: string;
  updates: InstanceResult[];
  metadata: EvaluationMetadata;
  totalScore: number;
}

export interface InstanceResult {
  instanceId: string;
  folderPath: string;
  success: boolean;
  error?: Error;
  executionTime: number;
  diffStats?: DiffStats;
  agentName: string;
  score: number;
}

export interface EvaluationMetadata {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  agentsUsed: string[];
  config: EvaluationConfig;
}

export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "EvaluationError";
  }
}

export class AgentExecutionError extends EvaluationError {
  constructor(message: string, details?: unknown) {
    super(message, "AGENT_EXECUTION_ERROR", details);
    this.name = "AgentExecutionError";
  }
}
