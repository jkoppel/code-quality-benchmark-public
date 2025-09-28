/**
 * Claude Code error types using Effect's Data.TaggedError
 *
 * These map directly to the result subtypes from the Claude Code SDK.
 */

import { Data } from "effect";

export type ClaudeCodeError =
  | ClaudeCodeMaxTurnsError
  | ClaudeCodeExecutionError
  | ClaudeCodeUnexpectedTerminationError;

interface ClaudeCodeErrorProps {
  readonly message?: string;
  readonly sessionId?: string;
}

export class ClaudeCodeMaxTurnsError extends Data.TaggedError(
  "ClaudeCodeMaxTurnsError",
)<
  ClaudeCodeErrorProps & {
    readonly originalErrorType: "error_max_turns";
  }
> {
  static make(sessionId?: string) {
    return new ClaudeCodeMaxTurnsError({
      message: "Maximum turns exceeded during Claude Code session",
      sessionId,
      originalErrorType: "error_max_turns" as const,
    });
  }
}

export class ClaudeCodeExecutionError extends Data.TaggedError(
  "ClaudeCodeExecutionError",
)<
  ClaudeCodeErrorProps & {
    readonly originalErrorType: "error_during_execution";
  }
> {
  static make(sessionId?: string): ClaudeCodeExecutionError {
    return new ClaudeCodeExecutionError({
      message: "Error occurred during Claude Code execution",
      sessionId,
      originalErrorType: "error_during_execution" as const,
    });
  }
}

export class ClaudeCodeUnexpectedTerminationError extends Data.TaggedError(
  "ClaudeCodeUnexpectedTerminationError",
)<
  ClaudeCodeErrorProps & {
    readonly originalErrorType?: undefined;
  }
> {
  static make(sessionId?: string): ClaudeCodeUnexpectedTerminationError {
    return new ClaudeCodeUnexpectedTerminationError({
      message:
        "Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)",
      sessionId,
      originalErrorType: undefined,
    });
  }
}
