import { Data, type Effect } from "effect";
import type { SuccessInstanceResult } from "../evaluator/result";
import type { LoggerConfig } from "../utils/logger/logger.ts";

/*****************************
     Coding Agent
******************************/

export type CodingAgent = (
  prompt: string,
  folderPath: string,
  port?: number,
) => Effect.Effect<void, Error, LoggerConfig>;

/*****************************
    Feature Addition Agent
******************************/

// TODO: figure out how to record the versions of the agent harnesses / clis and how best to expose configuration for the various agents

export interface FeatureAgent {
  getName(): string;
  applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Effect.Effect<SuccessInstanceResult, FeatureAgentError, LoggerConfig>;
}

/*****************************
    FeatureAgentError
******************************/

export class FeatureAgentError extends Data.TaggedError("FeatureAgentError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
