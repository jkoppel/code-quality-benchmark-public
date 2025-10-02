import * as path from "node:path";
import { Effect } from "effect";
import type { FeatureAgent } from "../agents/types.ts";
import { LoggerConfig } from "../utils/logger/logger.ts";
import type { EvaluationConfig } from "./config.ts";

export type InstanceDescriptor = {
  readonly instanceId: string;
  readonly instancePath: string;
  readonly port: number;
  readonly agent: FeatureAgent;
};

export function makeInstances(
  workspaceDir: string,
  basePort: number,
  agents: FeatureAgent[],
  config: EvaluationConfig,
): Effect.Effect<readonly InstanceDescriptor[], never, LoggerConfig> {
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    yield* logger.info("Creating program instances for updates");

    return agents.flatMap((agent, agentIndex) =>
      Array.from(
        { length: config.instancesPerFeatureAgent },
        (_, instanceIdx) => {
          const instanceId = `${agent.getName()}-${instanceIdx + 1}`;
          return {
            instanceId,
            agent,
            instancePath: path.join(workspaceDir, instanceId),
            port:
              basePort +
              agentIndex * config.instancesPerFeatureAgent +
              instanceIdx,
          } satisfies InstanceDescriptor;
        },
      ),
    );
  });
}
