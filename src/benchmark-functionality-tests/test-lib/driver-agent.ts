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
 * Incorporates session management and allows for querying with a schema. */
export class DriverAgent {
  private sessionId?: string;

  constructor(
    private readonly config: DriverAgentConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    logger.debug(`DriverAgent (for testing functionality) initialized with ${config}`);
  }

  getConfig() {
    return this.config;
  }

  // TODO: Think more about how to incorporate session mgmt
  // TODO: Use abort controller option to implement timeout

  async ask(
    prompt: string,
    /** config / options to override with */
    config?: DriverAgentConfig,
  ): Promise<Result<string, DriverAgentError>> {
    const options = config ?? this.config;
    const response = query({ prompt, options });

    for await (const message of response) {
      this.logger.debug(JSON.stringify(message));

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
}
