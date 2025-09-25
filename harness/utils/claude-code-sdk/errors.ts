/**
 * Base Claude Code error types that correspond to Claude Code SDK result types
 *
 * Most of these map directly to the result subtypes from the Claude Code SDK.
 */

export abstract class ClaudeCodeError extends Error {
  /** The error type reported by Claude Code, if available */
  abstract readonly originalErrorType?: string;

  constructor(
    message?: string,
    public readonly sessionId?: string,
  ) {
    super(message);
  }

  toJSON() {
    return {
      __errorClass: this.constructor.name,
      originalErrorType: this.originalErrorType,
      message: this.message,
      name: this.name,
      stack: this.stack,
      sessionId: this.sessionId,
    };
  }
}

export class ClaudeCodeMaxTurnsError extends ClaudeCodeError {
  readonly originalErrorType = "error_max_turns";

  constructor(
    message = "Maximum turns exceeded during Claude Code session",
    sessionId?: string,
  ) {
    super(message, sessionId);
  }

  static make(sessionId?: string): ClaudeCodeMaxTurnsError {
    return new ClaudeCodeMaxTurnsError(undefined, sessionId);
  }
}

export class ClaudeCodeExecutionError extends ClaudeCodeError {
  readonly originalErrorType = "error_during_execution";

  constructor(
    message = "Error occurred during Claude Code execution",
    sessionId?: string,
  ) {
    super(message, sessionId);
  }

  static make(sessionId?: string): ClaudeCodeExecutionError {
    return new ClaudeCodeExecutionError(undefined, sessionId);
  }
}

export class ClaudeCodeUnexpectedTerminationError extends ClaudeCodeError {
  readonly originalErrorType = undefined;

  constructor(
    message = "Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)",
    sessionId?: string,
  ) {
    super(message, sessionId);
  }

  static make(sessionId?: string): ClaudeCodeUnexpectedTerminationError {
    return new ClaudeCodeUnexpectedTerminationError(undefined, sessionId);
  }
}
