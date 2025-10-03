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

/*********************************************
   Feature Addition Agent Invocation Results
        aka 'Instance Result'
**********************************************/

export type InstanceResult = CompleteInstanceResult | FailedInstanceResult;

export interface InstanceMetadata {
  instanceId: string;
  instancePath: string;
  agentName: string;
  executionTimeMs: number;
}

/** Result from a feature addition agent's attempt that *successfully executed / ran to completion*
 * (but that may or may not pass functionality tests). */
export interface CompleteInstanceResult extends InstanceMetadata {
  /** eval ran to completion */
  type: "CompleteInstanceResult";
  diffStats: DiffStats;
  testSuiteResult: TestSuiteResult;
  score: number;
}

/** Info from a feature addition agent's attempt that failed */
export interface FailedInstanceResult extends InstanceMetadata {
  type: "FailedInstanceResult";
  score: 0;
  cause: string; // Pretty-printed from Effect's Cause
  errorType?: string; // Optional: original error _tag
  lastCheckpoint?: UpdateOnlyInstanceInfo;
}

export interface UpdateOnlyInstanceInfo extends InstanceMetadata {
  type: "UpdateOnlyInstanceInfo";
  diffStats: DiffStats;
}

// Type guard functions

export function isCompleteInstanceResult(
  result: InstanceResult,
): result is CompleteInstanceResult {
  return result.type === "CompleteInstanceResult";
}

export function isFailedInstanceResult(
  result: unknown,
): result is FailedInstanceResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "type" in result &&
    result.type === "FailedInstanceResult"
  );
}

// Helper factory functions

export function makeCompleteInstanceResult(
  instanceId: string,
  instancePath: string,
  agentName: string,
  executionTimeMs: number,
  diffStats: DiffStats = DiffStats.mempty(),
  testSuiteResult: TestSuiteResult,
  score: number = 0,
): CompleteInstanceResult {
  return {
    type: "CompleteInstanceResult",
    instanceId,
    instancePath,
    agentName,
    executionTimeMs,
    diffStats,
    testSuiteResult,
    score,
  };
}

export function makeFailedInstanceResult(
  instance: InstanceDescriptor,
  executionTimeMs: number,
  cause: string,
  errorType?: string,
  lastCheckpoint?: UpdateOnlyInstanceInfo,
): FailedInstanceResult {
  return {
    type: "FailedInstanceResult",
    instanceId: instance.instanceId,
    instancePath: instance.instancePath,
    agentName: instance.agent.getName(),
    executionTimeMs,
    cause,
    errorType,
    score: 0,
    lastCheckpoint,
  };
}

export function makeUpdateOnlyInfo(
  instanceId: string,
  folderPath: string,
  agentName: string,
  executionTimeMs: number,
  diffStats: DiffStats = DiffStats.mempty(),
): UpdateOnlyInstanceInfo {
  return {
    type: "UpdateOnlyInstanceInfo",
    instanceId,
    instancePath: folderPath,
    agentName,
    executionTimeMs,
    diffStats,
  };
}

// Accessors

export function getDiffStats(result: InstanceResult): DiffStats | undefined {
  return isCompleteInstanceResult(result) ? result.diffStats : undefined;
}
