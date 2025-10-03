import type { TestSuiteResult } from "../benchmark-test-lib/report.ts";
import type { EvaluationMetadata } from "./config.ts";
import { DiffStats } from "./diff-stats.ts";
import type { InstanceDescriptor } from "./instance.ts";

/*********************
   EvaluationResult
**********************/

export interface EvaluationResult {
  originalProgramPath: string;
  originalProgramSource: OriginalProgramSource;
  updatePrompt: string;
  updates: (
    | SuccessInstanceResultWithTestSuiteResult
    | SuccessInstanceResult
    | FailedInstanceResult
  )[];
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
        aka 'Instance Result'
**********************************************/

interface InstanceMetadata {
  instanceId: string;
  folderPath: string;
  agentName: string;
  executionTimeMs: number;
}

// -- TODO: Improve the types in the future
// eg prob better to have just one SuccessInstanceResult
// and then a failure type with a maybe lastCheckpoint?

/** Result from a feature addition agent's attempt that *successfully executed / ran to completion*
 * (but that may or may not pass functionality tests). */
export interface SuccessInstanceResult extends InstanceMetadata {
  type: "SuccessInstanceResult";
  diffStats: DiffStats;
  score: number;
}

export interface SuccessInstanceResultWithTestSuiteResult
  extends SuccessInstanceResult {
  testSuiteResult: TestSuiteResult;
}

/** Info from a feature addition agent's attempt that failed */
export interface FailedInstanceResult extends InstanceMetadata {
  type: "FailedInstanceResult";
  score: 0;
  cause: string; // Pretty-printed from Effect's Cause
  errorType?: string; // Optional: original error _tag
}

// Type guard functions

export function isSuccessInstanceResult(
  result: SuccessInstanceResult | FailedInstanceResult,
): result is SuccessInstanceResult {
  return result.type === "SuccessInstanceResult";
}

export function isFailedInstanceResult(
  result: SuccessInstanceResult | FailedInstanceResult,
): result is FailedInstanceResult {
  return result.type === "FailedInstanceResult";
}

// Helper factory functions

export function makeSuccessInstanceResult(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
  diffStats: DiffStats = DiffStats.mempty(),
  score: number = 0,
): SuccessInstanceResult {
  return {
    type: "SuccessInstanceResult",
    instanceId,
    folderPath,
    agentName,
    executionTimeMs,
    diffStats,
    score,
  };
}

export function makeFailedInstanceResult(
  instance: InstanceDescriptor,
  executionTimeMs: number,
  cause: string,
  errorType?: string,
): FailedInstanceResult {
  return {
    type: "FailedInstanceResult",
    instanceId: instance.instanceId,
    folderPath: instance.instancePath,
    agentName: instance.agent.getName(),
    executionTimeMs,
    cause,
    errorType,
    score: 0,
  };
}

// Accessors

export function getDiffStats(
  result: SuccessInstanceResult | FailedInstanceResult,
): DiffStats | undefined {
  return isSuccessInstanceResult(result) ? result.diffStats : undefined;
}
