import { query } from "@anthropic-ai/claude-code";
import { Effect, Option } from "effect";
import type { InstanceResult } from "../../evaluator/result.ts";
import {
  makeInvocationCompletedMempty,
  makeInvocationFailed,
} from "../../evaluator/result.ts";
import {
  type ClaudeCodeError,
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
import {
  consumeUntilTerminal,
  type StreamConversionError,
} from "../../utils/claude-code-sdk/response-stream.ts";
import {
  isExecutionErrorResult,
  isMaxTurnsErrorResult,
  isSuccessResult,
} from "../../utils/claude-code-sdk/type-guards.ts";
import { getLoggerConfig, type Logger } from "../../utils/logger/logger.ts";
import type { ClaudeAgentConfig } from "../types.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

export function isClaudeAgent(agent: unknown): agent is ClaudeAgent {
  return agent instanceof ClaudeAgent;
}

export class ClaudeAgent {
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
  ): Effect.Effect<
    InstanceResult,
    ClaudeCodeError | StreamConversionError,
    never
  > {
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
        const error = ClaudeCodeUnexpectedTerminationError.make();
        self.logger
          .withMetadata({
            error: error.message,
          })
          .error(`Failed to apply update for instance ${instanceId}`);
        return makeInvocationFailed(
          instanceId,
          folderPath,
          "claude",
          Date.now() - startTime,
          error,
        );
      }

      const message = maybeTerminalMessage.value;

      if (isSuccessResult(message)) {
        self.logger
          .withMetadata({
            instanceId,
            duration: message.duration_ms,
          })
          .debug(`Claude completed`);
        self.logger.info(
          `Successfully completed update for instance ${instanceId}`,
        );
        return makeInvocationCompletedMempty(
          instanceId,
          folderPath,
          "claude",
          Date.now() - startTime,
        );
      }

      if (isMaxTurnsErrorResult(message)) {
        const error = ClaudeCodeMaxTurnsError.make(message.session_id);
        self.logger
          .withMetadata({
            error: error.message,
          })
          .error(`Failed to apply update for instance ${instanceId}`);
        return makeInvocationFailed(
          instanceId,
          folderPath,
          "claude",
          Date.now() - startTime,
          error,
        );
      }

      if (isExecutionErrorResult(message)) {
        const error = ClaudeCodeExecutionError.make(message.session_id);
        self.logger
          .withMetadata({
            error: error.message,
          })
          .error(`Failed to apply update for instance ${instanceId}`);
        return makeInvocationFailed(
          instanceId,
          folderPath,
          "claude",
          Date.now() - startTime,
          error,
        );
      }

      // This should never happen given our find condition
      const error = ClaudeCodeUnexpectedTerminationError.make();
      self.logger
        .withMetadata({
          error: error.message,
        })
        .error(`Failed to apply update for instance ${instanceId}`);
      return makeInvocationFailed(
        instanceId,
        folderPath,
        "claude",
        Date.now() - startTime,
        error,
      );
    });
  }
}
