import unimplemented from "ts-unimplemented";
import type { z } from "zod";
import { Logger } from "../../utils/logger.js";
import { DriverAgent, type DriverAgentConfig } from "./driver-agent.js";
import type { PermissionMode } from "@anthropic-ai/claude-code";
import type { TestResult } from "./report.js";
import type { SutConfig } from "./runner.js";

/*************************************
  Test Case Agent
***************************************/

/** Each test case gets a new instance of the TestCaseAgent */
export interface TestCaseAgent {
  check(instructions: string): Promise<TestResult>;
  query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>>;
}

// TODO: Either have different query methods for whether to use vision-enabled Playwright, or have different TestCaseAgents

export class NonVisionTestCaseAgent implements TestCaseAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return unimplemented()
  }
}

export class VisionTestCaseAgent implements TestCaseAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return unimplemented();
  }
}

/***************************************************
  Claude Code config / options for Test Case Agent
****************************************************/

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

const CORE_TEST_CASE_AGENT_OPTIONS = {
  permissionMode: "bypassPermissions" as const satisfies PermissionMode, // NOTE THIS
  maxTurns: 15, // TODO: Tune this
  executable: "node",
} as const;

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
