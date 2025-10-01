import * as path from "node:path";
import type { FeatureAgent } from "../agents/types.ts";
import type { Logger } from "../utils/logger/logger.ts";
import type { EvaluationConfig } from "./config.ts";

export type InstanceDescriptor = {
  readonly instanceId: string;
  readonly agentName: string;
  readonly agent: unknown;
  readonly instancePath: string;
  readonly port: number;
};

export function makeInstances(
  logger: Logger,
  workspaceDir: string,
  basePort: number,
  agents: FeatureAgent[],
  config: EvaluationConfig,
) {
  logger.info("Creating program instances for updates");

  return agents.flatMap((agent, agentIndex) =>
    Array.from(
      { length: config.instancesPerFeatureAgent },
      (_, instanceIdx) => {
        const instanceId = `${agent.getName()}-${instanceIdx + 1}`;
        return {
          instanceId,
          agentName: agent.getName(),
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
}
