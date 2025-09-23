import type {
  SDKAssistantMessage,
  SDKMessage,
  SDKResultMessage,
  SDKUserMessage,
} from "@anthropic-ai/claude-code";

/**
 * Claude Code SDK utilities and type guards
 *
 * Since @anthropic-ai/claude-code doesn't export type guards,
 * we provide them here along with other SDK-related utilities.
 */

export function isAssistantMessage(
  message: SDKMessage,
): message is SDKAssistantMessage {
  return message.type === "assistant" && message.message?.content !== undefined;
}

export function isUserMessage(message: SDKMessage): message is SDKUserMessage {
  return message.type === "user" && message.message?.content !== undefined;
}

export function isSuccessResult(
  message: SDKMessage,
): message is Extract<SDKResultMessage, { subtype: "success" }> {
  return message.type === "result" && message.subtype === "success";
}

export function isMaxTurnsErrorResult(
  message: SDKMessage,
): message is Extract<SDKResultMessage, { subtype: "error_max_turns" }> {
  return message.type === "result" && message.subtype === "error_max_turns";
}

export function isExecutionErrorResult(
  message: SDKMessage,
): message is Extract<SDKResultMessage, { subtype: "error_during_execution" }> {
  return (
    message.type === "result" && message.subtype === "error_during_execution"
  );
}
