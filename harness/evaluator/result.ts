import { type ErrorObject, serializeError } from "serialize-error";
import type { EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";

/*********************
   EvaluationResult
**********************/

export interface EvaluationResult {
  originalProgramPath: string;
  originalProgramSource: OriginalProgramSource;
  updatePrompt: string;
  updates: InstanceResult[];
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

/*********************
   InstanceResult
**********************/

/** Scored result of an agent's feature addition attempt. */
export interface InstanceResult {
  instanceId: string;
  folderPath: string;
  agentName: string;
  executionTimeMs: number;
  result:
    | { type: "invocationFailed"; score: 0; error: ErrorObject }
    | { type: "invocationCompleted"; score: number; diffStats: DiffStats };
}

// Type guard functions

export function invocationCompleted(
  instance: InstanceResult,
): instance is InstanceResult & {
  result: { type: "invocationCompleted"; score: number; diffStats: DiffStats };
} {
  return instance.result.type === "invocationCompleted";
}

export function invocationFailed(
  instance: InstanceResult,
): instance is InstanceResult & {
  result: { type: "invocationFailed"; score: 0; error: ErrorObject };
} {
  return instance.result.type === "invocationFailed";
}

// Helper factory functions

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
    result: {
      type: "invocationFailed",
      score: 0,
      error: serializeError(error, { useToJSON: true }),
    },
  };
}

// Accessors

export function getDiffStats(instance: InstanceResult): DiffStats | undefined {
  return invocationCompleted(instance) ? instance.result.diffStats : undefined;
}
