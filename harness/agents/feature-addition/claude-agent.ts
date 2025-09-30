import { type Options, query } from "@anthropic-ai/claude-code";
import { Effect, Option } from "effect";
import {
  type InstanceResult,
  makeInstanceResult,
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
import { getLoggerConfig, type Logger } from "../../utils/logger/logger.ts";
import { AgentInvocationError, type FeatureAgent } from "../types.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

export type ClaudeAgentConfig = Pick<
  Options,
  "allowedTools" | "appendSystemPrompt" | "model"
>;

export function isClaudeAgent(agent: unknown): agent is ClaudeAgent {
  return agent instanceof ClaudeAgent;
}

export class ClaudeAgent implements FeatureAgent {
  private readonly logger: Logger;
  private readonly config: ClaudeAgentConfig;

  constructor(
    config: ClaudeAgentConfig = {},
    logger: Logger = getLoggerConfig().logger,
  ) {
    this.logger = logger;
    this.config = {
      // TODO: Will improve this later
      appendSystemPrompt: config.appendSystemPrompt ?? SYSTEM_PROMPT,
      allowedTools: config.allowedTools ?? [
        "Read",
        "Write",
        "Edit",
        "Bash",
        "LS",
        "Glob",
      ],
      model: config.model ?? "sonnet",
    };
  }

  /** Feature addition agents return a 'mempty' version of InstanceResult that is subsequently augmented with a score by the evaluator */
  applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Effect.Effect<InstanceResult, AgentInvocationError, never> {
    const startTime = Date.now();

    this.logger
      .withMetadata({
        folderPath,
        updatePrompt: updatePrompt.substring(0, 100),
      })
      .info(`Starting Claude agent for instance ${instanceId}`);

    const fullPrompt = getFullPrompt(updatePrompt, folderPath, port);

    const response = query({
      prompt: fullPrompt,
      options: this.config,
    });

    const self = this;
    return Effect.gen(function* () {
      const maybeTerminalMessage = yield* consumeUntilTerminal({
        response,
        logger: self.logger,
      });

      if (Option.isNone(maybeTerminalMessage)) {
        return yield* ClaudeCodeUnexpectedTerminationError.make();
      }

      const message = maybeTerminalMessage.value;

      if (isSuccessResult(message)) {
        self.logger
          .withMetadata({
            instanceId,
            duration: message.duration_ms,
          })
          .debug(`Claude completed`);
        self.logger.info(`✓ Update for instance ${instanceId} completed`);
        return makeInstanceResult(
          instanceId,
          folderPath,
          "claude",
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
          `Failed to apply update for instance ${instanceId}`,
          error,
        );
      }),
      Effect.mapError(
        (error) =>
          new AgentInvocationError({
            message: error.message,
            cause: error,
          }),
      ),
    );
  }
}
