/**
 * Centralized utility for converting Claude Code response streams to Effect streams
 */

import type { SDKMessage } from "@anthropic-ai/claude-code";
import { Data, Effect, type Option, Stream } from "effect";
import type { Logger } from "../logger/logger.ts";
import {
  isExecutionErrorResult,
  isMaxTurnsErrorResult,
  isSuccessResult,
} from "./type-guards.ts";

export class StreamConversionError extends Data.TaggedError(
  "StreamConversionError",
)<{
  message: string;
}> {}

export interface SessionManager {
  getSessionId(): string | undefined;
  setSessionId(id: string): void;
}

export interface ConsumeResponseStreamOptions<T extends SessionManager> {
  response: AsyncIterable<SDKMessage>;
  sessionManager?: T;
  logger?: Logger;
}

/**
 * Consumes a Claude Code response stream until a terminal message is found.
 *
 * This function:
 * - Converts the async iterable to an Effect Stream
 * - Session ID management (side effect)
 * - Logging (side effect)
 * - Consumes messages until terminal message (success/max_turns/execution_error)
 * - Returns the terminal message as an Option
 *
 * Business logic for handling different terminal message types should be handled by the caller.
 */
export function consumeUntilTerminal<T extends SessionManager>(
  options: ConsumeResponseStreamOptions<T>,
): Effect.Effect<Option.Option<SDKMessage>, StreamConversionError> {
  const { response, sessionManager, logger } = options;

  return Stream.fromAsyncIterable(
    response,
    (error) =>
      new StreamConversionError({
        message: `Failed to convert Claude Code response stream: ${error}`,
      }),
  ).pipe(
    Stream.tap((message) =>
      Effect.sync(() => {
        if (sessionManager && !sessionManager.getSessionId()) {
          sessionManager.setSessionId(message.session_id);
        }
        if (logger) {
          logger.withMetadata({ claudeCode: message }).debug("Response");
        }
      }),
    ),
    Stream.takeUntil(
      (message) =>
        isSuccessResult(message) ||
        isMaxTurnsErrorResult(message) ||
        isExecutionErrorResult(message),
    ),
    Stream.runLast,
    Effect.catchAll((streamError) =>
      Effect.fail(
        new StreamConversionError({
          message: `Stream conversion error: ${streamError.message}`,
        }),
      ),
    ),
  );
}
