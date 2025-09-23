import { query } from "@anthropic-ai/claude-code";
import { match } from "ts-pattern";
import type { InstanceResult } from "../../evaluator/types.ts";
import {
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
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

    try {
      this.logger
        .withMetadata({
          folderPath,
          updatePrompt: updatePrompt.substring(0, 100),
        })
        .info(`Starting Claude agent for instance ${instanceId}`);

      const fullPrompt = getFullPrompt(updatePrompt, folderPath, port);

      const CONTINUE_MARKER = null;
      for await (const message of query({
        prompt: fullPrompt,
        options: this.config,
      })) {
        this.logger
          .withMetadata({ instanceId, claudeCode: message })
          .debug("Response");

        const response = match(message)
          .with({ type: "result", subtype: "success" }, (msg) => {
            this.logger
              .withMetadata({
                instanceId,
                duration: msg.duration_ms,
              })
              .debug(`Claude completed`);
            return msg.result;
          })
          .with({ type: "result", subtype: "error_max_turns" }, () => {
            throw new ClaudeCodeMaxTurnsError();
          })
          .with({ type: "result", subtype: "error_during_execution" }, () => {
            throw new ClaudeCodeExecutionError();
          })
          .otherwise(() => {
            return CONTINUE_MARKER;
          });

        if (response !== CONTINUE_MARKER) {
          this.logger.info(
            `Successfully completed update for instance ${instanceId}`,
          );
          return {
            instanceId,
            folderPath,
            success: true,
            error: undefined,
            executionTime: Date.now() - startTime,
            agentName: "claude",
            score: 0,
          };
        }
      }

      throw new ClaudeCodeUnexpectedTerminationError();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger
        .withMetadata({
          error: error.message,
        })
        .error(`Failed to apply update for instance ${instanceId}`);

      return {
        instanceId,
        folderPath,
        success: false,
        error,
        executionTime: Date.now() - startTime,
        agentName: "claude",
        score: 0, // Will be calculated by evaluator based on diff
      };
    }
  }
}
