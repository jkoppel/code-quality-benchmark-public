import type { Options, PermissionMode } from "@anthropic-ai/claude-code";
import { query } from "@anthropic-ai/claude-code";
import unimplemented from "ts-unimplemented";
import type { z } from "zod";
import { Logger } from "../../utils/logger";
import type { TestResult } from "./report";

/*************************************
  Test Case Agent
***************************************/

// export type TestCaseAgentConfig = {};

export class TestCaseAgent {
  constructor(sutConfig: SutConfig, model: Model) {}

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return unimplemented();
  }
}

// (prompt: string, sutConfig: SutConfig) => Promise<void>;

/** Config for the system under test */
export interface SutConfig {
  folderPath: string;
  port: number;
}

/*************************************
    Driver Agent
***************************************/

// Specializing the following to Claude Code for now

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

type DriverAgentConfig = Pick<Options, "permissionMode" | "executable" | "maxTurns" | "cwd" | "mcpServers">;

type PlaywrightMCPCapability = "verify" | "vision";

function makePlaywrightMCPConfig(capabilities: PlaywrightMCPCapability[]) {
  const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.36";
  return {
    playwright: {
      type: "stdio",
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

const NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS = {
  ...CORE_TEST_CASE_AGENT_OPTIONS,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify"]),
  },
};

const VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS = {
  ...CORE_TEST_CASE_AGENT_OPTIONS,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify", "vision"]),
  },
};
