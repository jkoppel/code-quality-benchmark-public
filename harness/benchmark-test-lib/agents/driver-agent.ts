import type { Options } from "@anthropic-ai/claude-code";
import { query } from "@anthropic-ai/claude-code";
import dedent from "dedent";
import { Data, Effect, Option } from "effect";
import * as z from "zod";
import {
  type ClaudeCodeError,
  ClaudeCodeExecutionError,
  ClaudeCodeMaxTurnsError,
  ClaudeCodeUnexpectedTerminationError,
} from "../../utils/claude-code-sdk/errors.ts";
import { consumeUntilTerminal } from "../../utils/claude-code-sdk/response-stream.ts";
import {
  isExecutionErrorResult,
  isMaxTurnsErrorResult,
  isSuccessResult,
} from "../../utils/claude-code-sdk/type-guards.ts";
import { LoggerConfig } from "../../utils/logger/logger.ts";

// Specializing the following to Claude Code for now

/*************************************
    DriverAgentConfig
***************************************/

export type DriverAgentConfig = Pick<
  Options,
  | "permissionMode"
  | "executable"
  | "maxTurns"
  | "cwd"
  | "mcpServers"
  | "resume"
  | "disallowedTools"
>;

/*************************************
    Custom DriverAgentErrors
***************************************/

// We never want to convert DriverAgentErrors to failed TestResults -- if there is a
// DriverAgentError, there will not be a TestResult.

/* TODO: Add errors for CC usage limits

  [19:54:29.596] DEBUG: {"type":"assistant","message":{"id":"14293d70-dc57-40fb-8370-617f52a1eb8f","model":"<synthetic>","role":"assistant","stop_reason":"stop_sequence","stop_sequence":"","type":"message","usage":{"input_tokens":0,"output_tokens":0,"cache_creation_input_tokens":0,"cache_read_input_tokens":0,"server_tool_use":{"web_search_requests":0},"service_tier":null},"content":[{"type":"text","text":"5-hour limit reached ∙ resets 8pm"}]},"parent_tool_use_id":null,"session_id":"30fba92f-0607-4937-ba6e-878ddbf4cac4","uuid":"8e9003d5-1c28-41d8-8d4f-45550a55df6c"}
  [19:54:29.596] DEBUG: {"type":"result","subtype":"success","is_error":true,"duration_ms":684,"duration_api_ms":0,"num_turns":1,"result":"5-hour limit reached ∙ resets 8pm","session_id":"30fba92f-0607-4937-ba6e-878ddbf4cac4","total_cost_usd":0,"usage":{"input_tokens":0,"cache_creation_input_tokens":0,"cache_read_input_tokens":0,"output_tokens":0,"server_tool_use":{"web_search_requests":0},"service_tier":"standard"},"permission_denials":[],"uuid":"0a784f10-d4cd-4a24-972f-48d295909a50"}
  [19:54:29.597] INFO: Stopping dev server...
  [19:54:29.597] DEBUG: [pid=47994] <gracefully close start>
  [19:54:29.622] DEBUG: [pid=47994] <process did exit: exitCode=null, signal=SIGTERM>
  [19:54:29.622] INFO: Dev server exited cleanly
  [19:54:29.622] DEBUG: [pid=47994] starting temporary directories cleanup
  [19:54:29.622] DEBUG: [pid=47994] finished temporary directories cleanup
  [19:54:29.622] DEBUG: [pid=47994] <gracefully close end>
  [19:54:29.622] INFO: Dev server stopped
  [19:54:29.622] ERROR: Failed to run tests: DriverAgentExecutionError: Failed to parse response: Driver agent response was not wrapped in <response> tags
*/

export type DriverAgentError =
  | DriverAgentExecutionError
  | DriverAgentResponseFormatInvalid;

export class DriverAgentExecutionError extends Data.TaggedError(
  "DriverAgentExecutionError",
)<{
  readonly message: string;
  readonly sessionId?: string;
  readonly cause?: ClaudeCodeError | Error;
}> {}

export class DriverAgentResponseFormatInvalid extends Data.TaggedError(
  "DriverAgentResponseInvalid",
)<{
  readonly message: string;
  readonly sessionId?: string;
}> {}

/*************************************
           Driver Agent
***************************************/

/** The underlying driver for the test case agent.
 * Incorporates session management
 * (interactions with a new instance start a new Claude Code session,
 * but all interactions with an instance of the DriverAgent use the same session)
 * and allows for querying with a schema. */
export class DriverAgent {
  private sessionId?: string;

  constructor(private readonly config: DriverAgentConfig) {}

  getConfig() {
    return this.config;
  }

  // TODO: Use abort controller option to implement timeout

  ask(
    prompt: string,
    /** Additional config / options */
    additionalConfig?: Partial<DriverAgentConfig>,
  ): Effect.Effect<string, DriverAgentError, LoggerConfig> {
    const self = this;
    return Effect.gen(function* () {
      const { logger } = yield* LoggerConfig;

      const options = {
        ...self.getConfig(),
        ...additionalConfig,
        resume: self.getSessionId(), // session id managed by and only by DriverAgent
      };

      yield* logger.info(`[DRIVER-ASK] [PROMPT]\n${prompt}`);
      const response = query({
        prompt,
        options,
      });

      const result = yield* consumeUntilTerminal({
        response,
        sessionManager: self,
      }).pipe(
        Effect.mapError(
          (streamError) =>
            new DriverAgentExecutionError({
              message: `Stream conversion error: ${streamError.message}`,
              sessionId: self.getSessionId(),
              cause: streamError,
            }),
        ),
      );

      if (Option.isNone(result)) {
        return yield* new DriverAgentExecutionError({
          message: "Agent terminated unexpectedly",
          sessionId: self.getSessionId(),
          cause: ClaudeCodeUnexpectedTerminationError.make(self.getSessionId()),
        });
      }

      const message = result.value;

      if (isSuccessResult(message)) {
        return message.result;
      }
      if (isMaxTurnsErrorResult(message)) {
        return yield* new DriverAgentExecutionError({
          message: "Maximum turns exceeded",
          sessionId: self.getSessionId(),
          cause: ClaudeCodeMaxTurnsError.make(self.getSessionId()),
        });
      }
      if (isExecutionErrorResult(message)) {
        return yield* new DriverAgentExecutionError({
          message: "Execution error in TestCaseAgent driver",
          sessionId: self.getSessionId(),
          cause: ClaudeCodeExecutionError.make(self.getSessionId()),
        });
      }

      // should be impossible
      return yield* new DriverAgentExecutionError({
        message: "Unexpected message type",
        sessionId: self.getSessionId(),
      });
    });
  }

  query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
    /** Additional config / options */
    additionalConfig?: Partial<DriverAgentConfig>,
  ): Effect.Effect<z.infer<T>, DriverAgentError, LoggerConfig> {
    const self = this;
    return Effect.gen(function* () {
      const fullPrompt = dedent`
        ${prompt}

        You must respond with the json wrapped in <response> tags like this:
        <response>{raw JSON response}</response>

        The JSON must conform to this schema: ${JSON.stringify(z.toJSONSchema(outputSchema))}`;

      const result = yield* self.ask(fullPrompt, additionalConfig);

      // TODO: Refactor away the try/catch at some point
      try {
        const raw = yield* self.extractJsonFromResponse(result);
        return outputSchema.parse(JSON.parse(raw));
      } catch (error) {
        if (error instanceof z.ZodError) {
          return yield* new DriverAgentResponseFormatInvalid({
            message: `Validation failed: ${z.prettifyError(error)}`,
            sessionId: self.getSessionId(),
          });
        }
        return yield* new DriverAgentResponseFormatInvalid({
          message: `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
          sessionId: self.getSessionId(),
        });
      }
    });
  }

  private extractJsonFromResponse(
    text: string,
  ): Effect.Effect<string, DriverAgentResponseFormatInvalid> {
    const responseMatch = text.match(/<response>\s*([\s\S]*?)\s*<\/response>/);
    if (responseMatch) {
      return Effect.succeed(responseMatch[1].trim());
    }

    return Effect.fail(
      new DriverAgentResponseFormatInvalid({
        message: "Driver agent response was not wrapped in <response> tags",
        sessionId: this.getSessionId(),
      }),
    );
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /** Sets the session ID if not already set */
  setSessionId(sessionId: string): void {
    if (!this.sessionId) this.sessionId = sessionId;
  }
}
