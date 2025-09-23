import { query } from "@anthropic-ai/claude-code";
import type { InstanceResult } from "../../evaluator/types.ts";
import {
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
import {
  isAssistantMessage,
  isUserMessage,
} from "../../utils/claude-code-sdk/types.ts";
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

  async applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Promise<InstanceResult> {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;

    try {
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
        if (message.type === "result") {
          hasResult = true;
          if (message.subtype === "error_max_turns") {
            throw new ClaudeCodeMaxTurnsError();
          })
          .with({ type: "result", subtype: "error_during_execution" }, () => {
            throw new ClaudeCodeExecutionError();
          }
          this.logger
            .withMetadata({
              instanceId,
              duration: message.duration_ms,
            })
            .debug(`Claude completed`);
        } else if (message.type === "user" || message.type === "assistant") {
          let content = "Message content unavailable";

          if (isAssistantMessage(message)) {
            const messageContent = message.message?.content || [];
            content =
              typeof messageContent === "string"
                ? messageContent
                : JSON.stringify(messageContent);
          } else if (isUserMessage(message)) {
            const userContent = message.message?.content || [];
            content =
              typeof userContent === "string"
                ? userContent
                : JSON.stringify(userContent);
          }

          this.logger
            .withMetadata({
              instanceId,
              contentLength: content.length,
            })
            .debug(`Message from ${message.type}`);
        }
      }

      if (!hasResult) {
        throw new ClaudeCodeUnexpectedTerminationError();
      }

      success = true;
      this.logger.info(
        `Successfully completed update for instance ${instanceId}`,
      );
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      this.logger
        .withMetadata({
          error: error.message,
        })
        .error(`Failed to apply update for instance ${instanceId}`);
    }

    const result: InstanceResult = {
      instanceId,
      folderPath,
      success,
      error,
      executionTime: Date.now() - startTime,
      agentName: "claude",
      score: 0, // Will be calculated by evaluator based on diff
    };

    return result;
  }
}
