import * as path from "node:path";
import type { AgentConfig } from "../agents/feature-addition/config.ts";
import type { Logger } from "../utils/logger/logger.ts";

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
  instancesPerAgent: number,
  agents: AgentConfig[],
) {
  logger.info("Creating program instances for updates");

  return agents.flatMap((agentConfig, agentIndex) =>
    Array.from({ length: instancesPerAgent }, (_, instanceIdx) => {
      const instanceId = `${agentConfig.name}-${instanceIdx + 1}`;
      return {
        instanceId,
        agentName: agentConfig.name,
        agent: agentConfig.agent,
        instancePath: path.join(workspaceDir, instanceId),
        port: basePort + agentIndex * instancesPerAgent + instanceIdx,
      } satisfies InstanceDescriptor;
    }),
  );
}
