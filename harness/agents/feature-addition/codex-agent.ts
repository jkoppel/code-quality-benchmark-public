import * as path from "node:path";
import { Effect } from "effect";
import type { InstanceDescriptor } from "../../evaluator/instance.ts";
import {
  makeSuccessInstanceResult,
  type SuccessInstanceResult,
} from "../../evaluator/result.ts";
import { LoggerConfig } from "../../utils/logger/logger.ts";
import { createShellAgent } from "../shell-agent.ts";
import { type FeatureAgent, FeatureAgentError } from "../types.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

const codexScriptPath = path.resolve(process.cwd(), "agents/raw_codex.sh");

const baseCodexAgent = createShellAgent(codexScriptPath);

export class CodexAgent implements FeatureAgent {
  private readonly name = "codex";

  getName(): string {
    return this.name;
  }

  applyUpdate(
    updatePrompt: string,
    instance: InstanceDescriptor,
  ): Effect.Effect<SuccessInstanceResult, FeatureAgentError, LoggerConfig> {
    const startTime = Date.now();

    return Effect.gen(function* () {
      const { logger } = yield* LoggerConfig;

      yield* logger.info(
        `Starting Codex agent for instance ${instance.instanceId}`,
        {
          folderPath: instance.instancePath,
          updatePrompt: updatePrompt.substring(0, 100),
        },
      );

      const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(updatePrompt, instance.instancePath, instance.port)}`;

      return yield* baseCodexAgent(
        fullPrompt,
        instance.instancePath,
        instance.port,
      ).pipe(
        Effect.map(() =>
          makeSuccessInstanceResult(
            instance.instanceId,
            instance.instancePath,
            "codex",
            Date.now() - startTime,
          ),
        ),
        Effect.mapError((error) => {
          return new FeatureAgentError({
            message: `Codex agent failed for instance ${instance.instanceId}`,
            cause: error,
          });
        }),
        Effect.tapError((error) =>
          Effect.logError(
            `Failed to apply update for instance ${instance.instanceId}: ${error}`,
          ),
        ),
      );
    });
  }
}
