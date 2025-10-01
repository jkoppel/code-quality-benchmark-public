import { Data, type Effect } from "effect";
import type { InstanceResult } from "../evaluator/result";

/*****************************
     Coding Agent
******************************/

export type CodingAgent = (
  prompt: string,
  folderPath: string,
  port?: number,
) => Promise<void>;

/*****************************
    Feature Addition Agent
******************************/

export interface FeatureAgent {
  applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Effect.Effect<InstanceResult, AgentInvocationError, never>;
}

/*****************************
    AgentInvocationError
******************************/

export class AgentInvocationError extends Data.TaggedError(
  "AgentInvocationError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
