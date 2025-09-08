// TODO: Improve this

import { match } from "ts-pattern";
import type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
  SDKSystemMessage,
  NonNullableUsage,
} from "@anthropic-ai/claude-code";

export interface SerializationConfig {
  maxCodingAgentMessageLength: number;
  maxToolInputLength: number;
}

export const defaultSerializationConfig: SerializationConfig = {
  maxCodingAgentMessageLength: 1000,
  maxToolInputLength: 200,
};

export const claudeCodeSerializer = (message: SDKMessage) => {
  if (!message || typeof message !== "object") {
    return message;
  }

  return match(message)
    .with({ type: "assistant" }, (msg: SDKAssistantMessage) => {
      const content = msg.message?.content || [];
      const serialized: any = {
        type: "assistant",
        model: msg.message?.model,
        session_id: msg.session_id,
      };

      // Extract text content
      const textContent = content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join(" ");
      if (textContent) {
        serialized.text = textContent.substring(
          0,
          defaultSerializationConfig.maxCodingAgentMessageLength,
        );
      }

      // Extract tool usage
      const toolUses = content.filter((c: any) => c.type === "tool_use");
      if (toolUses.length > 0) {
        serialized.tools = toolUses.map((tool: any) => {
          const toolInfo: any = { name: tool.name };
          if (tool.input) {
            // Show actual input values, truncated if too long
            toolInfo.input = Object.fromEntries(
              Object.entries(tool.input).map(([key, value]) => [
                key,
                typeof value === "string" &&
                  value.substring(
                    0,
                    defaultSerializationConfig.maxToolInputLength,
                  ),
              ]),
            );
          }
          return toolInfo;
        });
      }

      // Extract usage metrics
      const usage = msg.message?.usage;
      if (usage) {
        serialized.usage = {
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_creation_input_tokens: usage.cache_creation_input_tokens,
          cache_read_input_tokens: usage.cache_read_input_tokens,
        };

        if (usage.cache_creation) {
          serialized.usage.cache_creation = {
            ephemeral_5m_input_tokens:
              usage.cache_creation.ephemeral_5m_input_tokens,
            ephemeral_1h_input_tokens:
              usage.cache_creation.ephemeral_1h_input_tokens,
          };
        }
      }

      return serialized;
    })
    .with({ type: "user" }, (msg: SDKUserMessage) => {
      const content = msg.message?.content || [];
      const serialized: any = {
        type: "user",
        session_id: msg.session_id,
      };

      // Extract text content
      const textContent = content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join(" ");
      if (textContent) {
        serialized.text =
          textContent.length >
          defaultSerializationConfig.maxCodingAgentMessageLength
            ? textContent.substring(
                0,
                defaultSerializationConfig.maxCodingAgentMessageLength,
              ) + "..."
            : textContent;
      }

      // Extract tool results
      const toolResults = content.filter((c: any) => c.type === "tool_result");
      if (toolResults.length > 0) {
        serialized.toolResults = toolResults.map((result: any) => {
          const resultInfo: any = {
            toolName: result.tool_name,
            toolId: result.tool_use_id,
            isError: result.is_error || false,
            contentTypes: Array.isArray(result.content)
              ? result.content.map((c: any) => c.type)
              : ["unknown"],
          };

          // Add preview of result content
          if (Array.isArray(result.content)) {
            const textContent = result.content
              .filter((c: any) => c.type === "text")
              .map((c: any) => c.text)
              .join(" ");
            if (textContent) {
              resultInfo.preview = textContent.substring(
                0,
                defaultSerializationConfig.maxToolInputLength,
              );
            }
          }

          return resultInfo;
        });
      }

      return serialized;
    })
    .with({ type: "result" }, (msg: SDKResultMessage) => {
      const serialized: any = {
        type: "result",
        subtype: msg.subtype,
        duration_ms: msg.duration_ms,
        total_cost_usd: msg.total_cost_usd,
        session_id: msg.session_id,
      };

      if ("result" in msg && typeof msg.result === "string") {
        serialized.resultLength = msg.result.length;
        serialized.resultPreview =
          msg.result.length > 100
            ? msg.result.substring(0, 100) + "..."
            : msg.result;
      }

      // Add error details for error subtypes
      if (msg.subtype?.startsWith("error") && "error" in msg) {
        serialized.error = (msg as any).error;
      }

      // Extract usage metrics
      const usage = msg.usage;
      if (usage) {
        serialized.usage = {
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_creation_input_tokens: usage.cache_creation_input_tokens,
          cache_read_input_tokens: usage.cache_read_input_tokens,
        };

        if (usage.cache_creation) {
          serialized.usage.cache_creation = {
            ephemeral_5m_input_tokens:
              usage.cache_creation.ephemeral_5m_input_tokens,
            ephemeral_1h_input_tokens:
              usage.cache_creation.ephemeral_1h_input_tokens,
          };
        }
      }

      return serialized;
    })
    .with({ type: "system" }, (msg: SDKSystemMessage) => ({
      type: "system",
      subtype: msg.subtype,
      apiKeySource: msg.apiKeySource,
      cwd: msg.cwd,
      session_id: msg.session_id,
    }))
    .otherwise(() => message);
};
