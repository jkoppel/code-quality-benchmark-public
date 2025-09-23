/**
 * Base Claude Code error types that correspond to Claude Code SDK result types
 *
 * These provide consistent error handling across all Claude Code integrations
 * and map directly to the result subtypes from the Claude Code SDK.
 */

export abstract class ClaudeCodeError extends Error {
  abstract readonly errorType: string;
}

export class ClaudeCodeMaxTurnsError extends ClaudeCodeError {
  readonly errorType = "error_max_turns";

  constructor(message = "Maximum turns exceeded during Claude Code session") {
    super(message);
  }
}

export class ClaudeCodeExecutionError extends ClaudeCodeError {
  readonly errorType = "error_during_execution";

  constructor(message = "Error occurred during Claude Code execution") {
    super(message);
  }
}

export class ClaudeCodeUnexpectedTerminationError extends ClaudeCodeError {
  readonly errorType = "unexpected_termination";

  constructor(
    message = "Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)",
  ) {
    super(message);
  }
}
