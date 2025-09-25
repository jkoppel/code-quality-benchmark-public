/**
 * Base Claude Code error types that correspond to Claude Code SDK result types
 *
 * Most of these map directly to the result subtypes from the Claude Code SDK.
 */

export abstract class ClaudeCodeError extends Error {
  /** The error type reported by Claude Code, if available */
  abstract readonly originalErrorType?: string;
}

export class ClaudeCodeMaxTurnsError extends ClaudeCodeError {
  readonly originalErrorType = "error_max_turns";

  constructor(message = "Maximum turns exceeded during Claude Code session") {
    super(message);
  }
}

export class ClaudeCodeExecutionError extends ClaudeCodeError {
  readonly originalErrorType = "error_during_execution";

  constructor(message = "Error occurred during Claude Code execution") {
    super(message);
  }
}

export class ClaudeCodeUnexpectedTerminationError extends ClaudeCodeError {
  readonly originalErrorType = undefined;

  constructor(
    message = "Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)",
  ) {
    super(message);
  }
}
