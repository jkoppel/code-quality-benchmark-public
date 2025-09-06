import { query } from "@anthropic-ai/claude-code";
import type { ClaudeAgentConfig, InstanceResult } from "../../types";
import { Logger } from "../../utils/logger.js";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.js";

export class ClaudeAgent {
  private readonly logger: Logger;
  private readonly config: ClaudeAgentConfig;

  constructor(
    config: ClaudeAgentConfig = {},
    logger: Logger = Logger.getInstance(),
  ) {
    this.logger = logger;
    this.config = {
      systemPrompt: config.systemPrompt || SYSTEM_PROMPT,
      allowedTools: config.allowedTools || [
        "Read",
        "Write",
        "Edit",
        "Bash",
        "LS",
        "Glob",
      ],
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
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
      this.logger.info(`Starting Claude agent for instance ${instanceId}`, {
        folderPath,
        updatePrompt: updatePrompt.substring(0, 100),
      });

      const fullPrompt = getFullPrompt(updatePrompt, folderPath, port);

      for await (const message of query({
        prompt: fullPrompt,
        options: {
          allowedTools: this.config.allowedTools,
          model: "sonnet",
        },
      })) {
        if (message.type === "result") {
          if (
            message.subtype === "error_max_turns" ||
            message.subtype === "error_during_execution"
          ) {
            throw new Error(`Claude execution error: ${message.subtype}`);
          }
          this.logger.debug(`Claude completed`, {
            instanceId,
            duration: message.duration_ms,
          });
        } else if (message.type === "user" || message.type === "assistant") {
          let content = "Message content unavailable";

          if (message.type === "assistant" && "text" in message) {
            content = (message as any).text;
          } else if (message.type === "user" && "content" in message) {
            const userContent = (message as any).content;
            content =
              typeof userContent === "string"
                ? userContent
                : JSON.stringify(userContent);
          }

          this.logger.debug(`Message from ${message.type}`, {
            instanceId,
            contentLength: content.length,
          });
        }
      }

      success = true;
      this.logger.info(
        `Successfully completed update for instance ${instanceId}`,
      );
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Failed to apply update for instance ${instanceId}`, {
        error: error.message,
      });
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
