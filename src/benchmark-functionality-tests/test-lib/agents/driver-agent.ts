import type { Options } from "@anthropic-ai/claude-code";
import { query } from "@anthropic-ai/claude-code";
import dedent from "dedent";
import { match } from "ts-pattern";
import * as z from "zod";
import { getLoggerConfig, type Logger } from "../../../utils/logger/logger.js";
import { jsonStringify } from "../../../utils/logger/pretty.js";
import type { SutConfig } from "../runner.js";

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

export function makeDriverAgentConfig(
  baseConfig: Partial<Options>,
  mcpServers: Options["mcpServers"],
  sutConfig: SutConfig,
): DriverAgentConfig {
  return {
    ...baseConfig,
    mcpServers,
    cwd: sutConfig.folderPath,
  };
}

/*************************************
    Custom DriverAgentErrors
***************************************/

// We throw errors because errors here are likely reflect either
// infra issues or a badly written test case.
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
    super(
      "Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)",
    );
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
    private readonly logger: Logger = getLoggerConfig().logger,
  ) {
    logger.debug(
      `DriverAgent (for testing functionality) initialized with ${jsonStringify(config)}`,
    );
  }

  getConfig() {
    return this.config;
  }

  // TODO: Use abort controller option to implement timeout

  async ask(
    prompt: string,
    /** Additional config / options */
    additionalConfig?: Partial<DriverAgentConfig>,
  ): Promise<string> {
    const options = {
      ...this.getConfig(),
      ...additionalConfig,
      resume: this.getSessionId(), // session id managed by and only by DriverAgent
    };
    this.logger.debug(`[DRIVER-ASK] [PROMPT]\n${prompt}`);
    const response = query({
      prompt,
      options,
    });

    for await (const message of response) {
      this.logger.withMetadata({ claudeCode: message }).debug("Response");

      if (!this.getSessionId()) {
        this.setSessionId(message.session_id);
      }

      const result = match(message)
        .with({ type: "result", subtype: "success" }, (msg) => msg.result || "")
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

  async query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
    /** Additional config / options */
    additionalConfig?: Partial<DriverAgentConfig>,
  ): Promise<z.infer<T>> {
    const fullPrompt = dedent`
      ${prompt}

      You must respond with the json wrapped in <response> tags like this:
      <response>{raw JSON response}</response>

      The JSON must conform to this schema: ${JSON.stringify(z.toJSONSchema(outputSchema))}`;

    const result = await this.ask(fullPrompt, additionalConfig);

    try {
      const raw = this.extractJsonFromResponse(result);
      const validated = outputSchema.parse(JSON.parse(raw));
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DriverAgentExecutionError(
          `Validation failed: ${z.prettifyError(error)}`,
        );
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

    throw new DriverAgentExecutionError(
      "Driver agent response was not wrapped in <response> tags",
    );
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /** Sets the session ID if not already set */
  private setSessionId(sessionId: string): void {
    if (!this.sessionId) this.sessionId = sessionId;
  }
}
