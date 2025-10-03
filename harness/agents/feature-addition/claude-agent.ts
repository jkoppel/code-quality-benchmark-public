import { type Options, query } from "@anthropic-ai/claude-code";
import { Effect, Option } from "effect";
import type { InstanceDescriptor } from "../../evaluator/instance.ts";
import {
  makeUpdateOnlyInfo,
  type UpdateOnlyInstanceInfo,
} from "../../evaluator/result.ts";
import {
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
import { consumeUntilTerminal } from "../../utils/claude-code-sdk/response-stream.ts";
import {
  isExecutionErrorResult,
  isMaxTurnsErrorResult,
  isSuccessResult,
} from "../../utils/claude-code-sdk/type-guards.ts";
import { LoggerConfig } from "../../utils/logger/logger.ts";
import { type FeatureAgent, FeatureAgentError } from "../types.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

export type ClaudeAgentConfig = Pick<
  Options,
  "allowedTools" | "appendSystemPrompt" | "model"
>;

export function isClaudeAgent(agent: unknown): agent is ClaudeAgent {
  return agent instanceof ClaudeAgent;
}

export class ClaudeAgent implements FeatureAgent {
  private readonly name = "claude-code";
  private readonly config: ClaudeAgentConfig;

  constructor() {
    this.config = {
      // TODO: Will make this configurable in the future
      appendSystemPrompt: SYSTEM_PROMPT,
      allowedTools: ["Read", "Write", "Edit", "Bash", "LS", "Glob"],
      model: "sonnet",
    };
  }

  getName(): string {
    return this.name;
  }

  applyUpdate(
    updatePrompt: string,
    instance: InstanceDescriptor,
  ): Effect.Effect<UpdateOnlyInstanceInfo, FeatureAgentError, LoggerConfig> {
    const startTime = Date.now();
    const self = this;

    return Effect.gen(function* () {
      const { logger } = yield* LoggerConfig;

      yield* logger.info(
        `Starting Claude agent for instance ${instance.instanceId}`,
        {
          folderPath: instance.instancePath,
          updatePrompt: updatePrompt.substring(0, 100),
        },
      );

      const response = query({
        prompt: getFullPrompt(
          updatePrompt,
          instance.instancePath,
          instance.port,
        ),
        options: self.config,
      });

      const maybeTerminalMessage = yield* consumeUntilTerminal({
        response,
      });

      if (Option.isNone(maybeTerminalMessage)) {
        return yield* ClaudeCodeUnexpectedTerminationError.make();
      }

      const message = maybeTerminalMessage.value;

      if (isSuccessResult(message)) {
        yield* logger.debug(`Claude completed`, {
          instanceId: instance.instanceId,
          duration: message.duration_ms,
        });
        yield* logger.info(
          `✓ Update for instance ${instance.instanceId} completed`,
        );
        return makeUpdateOnlyInfo(
          instance.instanceId,
          instance.instancePath,
          self.getName(),
          Date.now() - startTime,
        );
      }

      if (isMaxTurnsErrorResult(message)) {
        return yield* ClaudeCodeMaxTurnsError.make(message.session_id);
      }

      if (isExecutionErrorResult(message)) {
        return yield* ClaudeCodeExecutionError.make(message.session_id);
      }

      // should be impossible
      return yield* ClaudeCodeUnexpectedTerminationError.make();
    }).pipe(
      Effect.tapError((error) => {
        return Effect.logError(
          `Failed to apply update for instance ${instance.instanceId}`,
          error,
        );
      }),
      Effect.mapError(
        (error) =>
          new FeatureAgentError({
            message: error.message,
            cause: error,
          }),
      ),
    );
  }
}
