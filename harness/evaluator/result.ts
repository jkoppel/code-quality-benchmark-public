import type { EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";

/*********************
   EvaluationResult
**********************/

export interface EvaluationResult {
  originalProgramPath: string;
  originalProgramSource: OriginalProgramSource;
  updatePrompt: string;
  updates: (InstanceResult | AgentInvocationFailure)[];
  metadata: EvaluationMetadata;
  totalScore: number;
}

export type OriginalProgramSource =
  | { type: "pre-existing" } // i.e, supplied by the user
  | { type: "generatedInRun"; initialPrompt: string };

export function wasGeneratedInRun(
  result: EvaluationResult,
): result is EvaluationResult & {
  originalProgramSource: { type: "generatedInRun" };
} {
  return result.originalProgramSource.type === "generatedInRun";
}

/*********************************************
   Feature Addition Agent Invocation Results
**********************************************/

interface InstanceMetadata {
  instanceId: string;
  folderPath: string;
  agentName: string;
  executionTimeMs: number;
}

/** Successful result from a feature addition agent's attempt. */
export interface InstanceResult extends InstanceMetadata {
  type: "InstanceResult";
  diffStats: DiffStats;
  score: number;
}

/** Info from a feature addition agent's attempt that failed */
export interface AgentInvocationFailure extends InstanceMetadata {
  type: "AgentInvocationFailure";
  score: 0;
  cause: string; // Pretty-printed from Effect's Cause
  errorType?: string; // Optional: original error _tag
}

// Type guard functions

export function isInvocationSuccess(
  result: InstanceResult | AgentInvocationFailure,
): result is InstanceResult {
  return result.type === "InstanceResult";
}

export function isInvocationFailure(
  result: InstanceResult | AgentInvocationFailure,
): result is AgentInvocationFailure {
  return result.type === "AgentInvocationFailure";
}

// Helper factory functions

export function makeInstanceResult(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
  diffStats: DiffStats = DiffStats.mempty(),
  score: number = 0,
): InstanceResult {
  return {
    type: "InstanceResult",
    instanceId,
    folderPath,
    agentName,
    executionTimeMs,
    diffStats,
    score,
  };
}

export function makeAgentInvocationFailure(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
  cause: string,
  errorType?: string,
): AgentInvocationFailure {
  return {
    type: "AgentInvocationFailure",
    instanceId,
    folderPath,
    agentName,
    executionTimeMs,
    cause,
    errorType,
    score: 0,
  };
}

// Accessors

export function getDiffStats(
  result: InstanceResult | AgentInvocationFailure,
): DiffStats | undefined {
  return isInvocationSuccess(result) ? result.diffStats : undefined;
}
