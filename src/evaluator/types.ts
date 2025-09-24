import type { ClaudeAgentConfig } from "../agents/types.ts";
import { DiffStats } from "./diff-stats.ts";

export interface EvaluationConfig {
  workspaceRoot?: string;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
  claudeConfig?: ClaudeAgentConfig;
}

export interface EvaluationResult {
  initialPrompt: string;
  updatePrompt: string;
  originalProgramPath: string;
  updates: InstanceResult[];
  metadata: EvaluationMetadata;
  totalScore: number;
}

// TODO: Refactor to use serialized errors later
/** Scored result of an agent's feature addition attempt. */
export interface InstanceResult {
  instanceId: string;
  folderPath: string;
  agentName: string;
  executionTimeMs: number;
  result:
    | { type: "invocationFailed"; score: 0; error: Error }
    | { type: "invocationCompleted"; score: number; diffStats: DiffStats };
}

// Helper functions for agents to create InstanceResult with mempty values

export function makeInvocationCompletedMempty(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
): InstanceResult {
  return {
    instanceId,
    folderPath,
    agentName,
    executionTimeMs,
    result: {
      type: "invocationCompleted",
      score: 0,
      diffStats: DiffStats.mempty(),
    },
  };
}

export function makeInvocationFailed(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
  error: Error,
): InstanceResult {
  return {
    instanceId,
    folderPath,
    agentName,
    executionTimeMs,
    result: { type: "invocationFailed", score: 0, error },
  };
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
