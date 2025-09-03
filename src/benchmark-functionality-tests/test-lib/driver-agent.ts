import type { Options, PermissionMode } from "@anthropic-ai/claude-code";
import unimplemented from "ts-unimplemented";
import { Logger } from "../../utils/logger";

/*************************************
    Driver Agent
***************************************/

// Specializing the following to Claude Code for now

type DriverAgentConfig = Pick<Options, "permissionMode" | "executable" | "maxTurns" | "cwd" | "mcpServers">;

/** The underlying agent behind the test runner */
export class DriverAgent {
  constructor(
    private readonly config: DriverAgentConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    logger.debug(`DriverAgent (for testing functionality) initialized with ${config}`);
  }

  getConfig() {
    return this.config;
  }

  async ask(prompt: string): Promise<string> {
    return unimplemented();
  }
}

type PlaywrightMCPCapability = "verify" | "vision";

function makePlaywrightMCPConfig(capabilities: PlaywrightMCPCapability[]) {
  const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.36";
  return {
    playwright: {
      type: "stdio" as const,
      command: "npx",
      args: ["-y", PLAYWRIGHT_MCP, "--isolated", capabilities.length > 0 ? `--caps=${capabilities.join(",")}` : ""],
    },
  };
}

// Claude Code config / options

const CORE_TEST_CASE_AGENT_OPTIONS = {
  permissionMode: "bypassPermissions" satisfies PermissionMode, // NOTE THIS
  maxTurns: 15, // TODO: Tune this
  executable: "node",
};

export const NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS: DriverAgentConfig = {
  ...CORE_TEST_CASE_AGENT_OPTIONS,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify"]),
  },
};

export const VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS: DriverAgentConfig = {
  ...CORE_TEST_CASE_AGENT_OPTIONS,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify", "vision"]),
  },
};
