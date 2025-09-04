import type { Options } from "@anthropic-ai/claude-code";
import { query } from "@anthropic-ai/claude-code";
import dedent from "dedent";
import { match } from "ts-pattern";
import * as z from "zod";
import { Logger } from "../../utils/logger.js";

// Specializing the following to Claude Code for now

/*************************************
    DriverAgentConfig
***************************************/

export type DriverAgentConfig = Pick<
  Options,
  "permissionMode" | "executable" | "maxTurns" | "cwd" | "mcpServers" | "resume"
>;

/*************************************
    Custom DriverAgentErrors
***************************************/

// We throw errors because errors here are likely reflect either
// infra issues or a badly written test case.
// We never want to convert DriverAgentErrors to failed TestResults -- if there is a
// DriverAgentError, there will not be a TestResult.

export class DriverAgentMaxTurnsError extends Error {
  constructor() {
    super("Maximum turns exceeded during Claude Code session");
    this.name = "DriverAgentMaxTurnsError";
  }
}

export class DriverAgentExecutionError extends Error {
  constructor(message?: string) {
    super(message || "Error occurred during Claude Code execution");
    this.name = "DriverAgentExecutionError";
  }
}

export class DriverAgentUnexpectedTerminationError extends Error {
  constructor() {
    super("Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)");
    this.name = "DriverAgentUnexpectedTerminationError";
  }
}

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

  constructor(
    private readonly config: DriverAgentConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    logger.debug(`DriverAgent (for testing functionality) initialized with ${JSON.stringify(config)}`);
  }

  getConfig() {
    return this.config;
  }

  // TODO: Use abort controller option to implement timeout

  private buildQueryOptions(additional?: DriverAgentConfig) {
    return {
      ...this.getConfig(),
      ...additional,
      resume: this.getSessionId(), // session id managed by and only by DriverAgent
    };
  }

  async ask(
    prompt: string,
    /** config / options to override with */
    config?: DriverAgentConfig,
  ): Promise<string> {
    const response = query({
      prompt,
      options: this.buildQueryOptions(config),
    });

    for await (const message of response) {
      this.logger.debug(JSON.stringify(message));

      if (!this.getSessionId()) {
        this.setSessionId(message.session_id);
      }

      const result = match(message)
        .with({ type: "result", subtype: "success" }, (msg) => msg.result ?? "")
        .with({ type: "result", subtype: "error_max_turns" }, () => {
          throw new DriverAgentMaxTurnsError();
        })
        .with({ type: "result", subtype: "error_during_execution" }, () => {
          throw new DriverAgentExecutionError();
        })
        .otherwise(() => null);

      if (result !== null) return result;
    }

    throw new DriverAgentUnexpectedTerminationError();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    const fullPrompt = dedent`
      ${prompt}

      You must respond with the json wrapped in <response> tags like this:
      <response>{raw JSON response}</response>

      The JSON must conform to this schema: ${JSON.stringify(z.toJSONSchema(outputSchema), null, 2)}`;

    const result = await this.ask(fullPrompt);

    try {
      const raw = this.extractJsonFromResponse(result);
      const validated = outputSchema.parse(JSON.parse(raw));
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DriverAgentExecutionError(`Validation failed: ${z.prettifyError(error)}`);
      }
      throw new DriverAgentExecutionError(
        `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private extractJsonFromResponse(text: string): string {
    const responseMatch = text.match(/<response>\s*([\s\S]*?)\s*<\/response>/);
    if (responseMatch) {
      return responseMatch[1].trim();
    }

    throw new DriverAgentExecutionError("Driver agent response was not wrapped in <response> tags");
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /** Sets the session ID if not already set */
  private setSessionId(sessionId: string): void {
    if (!this.sessionId) this.sessionId = sessionId;
  }
}
