import { query } from "@anthropic-ai/claude-code";
import type { InstanceResult } from "../../evaluator/types.ts";
import {
  makeInvocationCompletedMempty,
  makeInvocationFailed,
} from "../../evaluator/types.ts";
import {
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
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
  async applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Promise<InstanceResult> {
    const startTime = Date.now();

    this.logger
      .withMetadata({
        folderPath,
        updatePrompt: updatePrompt.substring(0, 100),
      })
      .info(`Starting Claude agent for instance ${instanceId}`);

    const fullPrompt = getFullPrompt(updatePrompt, folderPath, port);

    for await (const message of query({
      prompt: fullPrompt,
      options: this.config,
    })) {
      this.logger
        .withMetadata({ instanceId, claudeCode: message })
        .debug("Response");

      if (isSuccessResult(message)) {
        this.logger
          .withMetadata({
            instanceId,
            duration: message.duration_ms,
          })
          .debug(`Claude completed`);
        this.logger.info(
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
        const error = new ClaudeCodeMaxTurnsError();
        this.logger
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
        const error = new ClaudeCodeExecutionError();
        this.logger
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
    }

    const error = new ClaudeCodeUnexpectedTerminationError();
    this.logger
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
}
