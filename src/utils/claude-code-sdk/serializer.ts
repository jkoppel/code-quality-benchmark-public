import type {
  NonNullableUsage,
  SDKAssistantMessage,
  SDKMessage,
  SDKSystemMessage,
  SDKUserMessage,
} from "@anthropic-ai/claude-code";
import type {
  ContentBlock,
  ContentBlockParam,
  TextBlockParam,
  ToolResultBlockParam,
  ToolUseBlock,
  Usage,
} from "@anthropic-ai/sdk/resources/messages";
import { match } from "ts-pattern";

export interface SerializationConfig {
  maxCodingAgentMessageLength: number;
  maxToolContentLength: number;
}

export const defaultSerializationConfig: SerializationConfig = {
  maxCodingAgentMessageLength: 1000,
  maxToolContentLength: 500,
};

const TRUNCATION_INDICATOR = "[...]";

export const claudeCodeSerializer = (message: SDKMessage) => {
  return match(message)
    .with({ type: "assistant" }, (msg: SDKAssistantMessage) => {
      const content = msg.message?.content || [];
      const toolUses = Array.isArray(content)
        ? content.filter((c: ContentBlock) => c.type === "tool_use")
        : [];

      const sanitizedContent =
        typeof content !== "string" && content.length > 0
          ? content.map(sanitizeContentBlock)
          : undefined;
      const serializedTools = toolUses.map((tool: ToolUseBlock) => ({
        name: tool.name,
        input: tool.input
          ? serializeToolInput(tool.input, defaultSerializationConfig)
          : undefined,
      }));

      return {
        type: "assistant",
        model: msg.message?.model,
        session_id: msg.session_id,
        text: processTextContent(content, defaultSerializationConfig),
        content: sanitizedContent,
        tools: serializedTools,
        usage: msg.message?.usage && extractUsageMetrics(msg.message.usage),
      };
    })
    .with({ type: "user" }, (msg: SDKUserMessage) => {
      const content = msg.message?.content || [];
      const toolResults = Array.isArray(content)
        ? content.filter((c: ContentBlockParam) => c.type === "tool_result")
        : [];
      const sanitizedContent =
        typeof content !== "string" && content.length > 0
          ? content.map(sanitizeContentBlock)
          : undefined;
      const serializedToolResults = toolResults.map(
        (result: ToolResultBlockParam) => {
          const resultTextContent = Array.isArray(result.content)
            ? extractTextContent(result.content)
            : "";

          return {
            toolName: result.tool_use_id,
            toolId: result.tool_use_id,
            isError: result.is_error || false,
            contentTypes: Array.isArray(result.content)
              ? result.content.map((c: ContentBlockParam) => c.type)
              : ["unknown"],
            preview: truncate(
              resultTextContent,
              defaultSerializationConfig.maxToolContentLength,
            ),
          };
        },
      );

      return {
        type: "user",
        text: processTextContent(content, defaultSerializationConfig),
        content: sanitizedContent,
        toolResults: serializedToolResults,
      };
    })
    .with({ type: "result", subtype: "success" }, (msg) => {
      return {
        type: "result",
        subtype: msg.subtype,
        result: msg.result,
        usage: extractUsageMetrics(msg.usage),
      };
    })
    .with({ type: "result", subtype: "error_max_turns" }, (msg) => {
      return {
        type: "result",
        subtype: msg.subtype,
        usage: extractUsageMetrics(msg.usage),
      };
    })
    .with({ type: "result", subtype: "error_during_execution" }, (msg) => {
      return {
        type: "result",
        subtype: msg.subtype,
        usage: extractUsageMetrics(msg.usage),
      };
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

/****************************
      Helper functions
*****************************/

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + TRUNCATION_INDICATOR;
}

function extractTextContent(content: string | ContentBlockParam[]): string {
  if (typeof content === "string") {
    return content;
  }

  return content
    .filter((c: ContentBlockParam): c is TextBlockParam => c.type === "text")
    .map((c: TextBlockParam) => c.text)
    .join(" ");
}

function processTextContent(
  content: string | ContentBlockParam[],
  config: SerializationConfig,
): string {
  return truncate(
    extractTextContent(content),
    config.maxCodingAgentMessageLength,
  );
}

// biome-ignore lint/suspicious/noExplicitAny: Dynamic media source structure
function sanitizeMediaSource(source: any) {
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic result object
  const result: any = {
    type: source?.type,
    media_type: source?.media_type,
  };

  if (source?.type === "url") {
    result.url = source.url;
  } else if (source?.type === "base64") {
    result.data_size = source?.data?.length || 0;
  }

  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: Dynamic content block types
function sanitizeContentBlock(block: any): any {
  if (block.type === "image") {
    return {
      type: "image",
      source: sanitizeMediaSource(block.source),
    };
  }

  if (block.type === "document") {
    return {
      type: "document",
      source: sanitizeMediaSource(block.source),
      title: block.title,
    };
  }

  if (block.type === "tool_result") {
    return {
      ...block,
      content:
        typeof block.content === "string"
          ? truncate(
              block.content,
              defaultSerializationConfig.maxToolContentLength,
            )
          : block.content,
    };
  }

  return block;
}

function extractUsageMetrics(usage: Usage | NonNullableUsage) {
  // TODO: Not sure we need all of these
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cache_creation_input_tokens: usage.cache_creation_input_tokens,
    cache_read_input_tokens: usage.cache_read_input_tokens,
    ...(usage.cache_creation && {
      cache_creation: {
        ephemeral_5m_input_tokens:
          usage.cache_creation.ephemeral_5m_input_tokens,
        ephemeral_1h_input_tokens:
          usage.cache_creation.ephemeral_1h_input_tokens,
      },
    }),
  };
}

function serializeToolInput(
  input: unknown,
  config: SerializationConfig,
): unknown {
  if (!input || typeof input !== "object") {
    return input;
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string"
        ? truncate(value, config.maxToolContentLength)
        : value,
    ]),
  );
}
