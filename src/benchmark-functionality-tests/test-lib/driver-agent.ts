import type { Options } from "@anthropic-ai/claude-code";
import { query } from "@anthropic-ai/claude-code";
import { match } from "ts-pattern";
import type { Result } from "../../utils/helper-types.js";
import { Logger } from "../../utils/logger.js";

/*************************************
    Driver Agent
***************************************/

// Specializing the following to Claude Code for now

export type DriverAgentConfig = Pick<
  Options,
  "permissionMode" | "executable" | "maxTurns" | "cwd" | "mcpServers" | "resume"
>;

export type DriverAgentError =
  | { type: "error_max_turns" }
  | { type: "error_during_execution"; message?: string }
  | { type: "unexpected_termination" }; // Claude Code stream ended without sending expected result message (network issues, service bugs, etc.)

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
  ): Promise<Result<string, DriverAgentError>> {
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
        .with({ type: "result", subtype: "success" }, (msg) => ({
          type: "success" as const,
          value: msg.result ?? "",
        }))
        .with({ type: "result", subtype: "error_max_turns" }, () => ({
          type: "failure" as const,
          error: { type: "error_max_turns" as const },
        }))
        .with({ type: "result", subtype: "error_during_execution" }, () => ({
          type: "failure" as const,
          error: { type: "error_during_execution" as const },
        }))
        .otherwise(() => null);

      if (result) return result;
    }

    return { type: "failure", error: { type: "unexpected_termination" } };
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /** Sets the session ID if not already set */
  private setSessionId(sessionId: string): void {
    if (!this.sessionId) this.sessionId = sessionId;
  }
}
