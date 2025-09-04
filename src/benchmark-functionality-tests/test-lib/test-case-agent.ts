import type { PermissionMode } from "@anthropic-ai/claude-code";
import dedent from "dedent";
import type { z } from "zod";
import { Logger } from "../../utils/logger.js";
import { DriverAgent, type DriverAgentConfig } from "./driver-agent.js";
import type { TestResult } from "./report.js";
import { TestResultSchema } from "./report.js";
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

// TODO: Check if need to use sutConfig in some way here -- or maybe limit it to runner...

export class NonVisionTestCaseAgent implements TestCaseAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    this.logger.debug(`NonVisionTestCaseAgent.check: ${instructions}`);
    const response = await this.driver.ask(dedent`
      Check the following: ${instructions}

      Respond with JSON conforming to ${JSON.stringify(TestResultSchema.shape)}
    `);
    const result = await this.driver.query(response, TestResultSchema);
    this.logger.debug(`NonVisionTestCaseAgent.check result: ${JSON.stringify(result)}`);
    return result;
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return await this.driver.query(prompt, outputSchema);
  }
}

export class VisionTestCaseAgent implements TestCaseAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    this.logger.debug(`VisionTestCaseAgent.check: ${instructions}`);
    const response = await this.driver.ask(dedent`
      Check the following: ${instructions}

      Respond with JSON conforming to ${JSON.stringify(TestResultSchema.shape)}
    `);
    const result = await this.driver.query(response, TestResultSchema);
    this.logger.debug(`VisionTestCaseAgent.check result: ${JSON.stringify(result)}`);
    return result;
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return await this.driver.query(prompt, outputSchema);
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

const CORE_TEST_CASE_AGENT_CONFIG = {
  permissionMode: "bypassPermissions" as const satisfies PermissionMode, // NOTE THIS
  maxTurns: 15, // TODO: Tune this
  executable: "node",
} as const;

export const NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG: DriverAgentConfig = {
  ...CORE_TEST_CASE_AGENT_CONFIG,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify"]),
  },
};

export const VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG: DriverAgentConfig = {
  ...CORE_TEST_CASE_AGENT_CONFIG,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify", "vision"]),
  },
};
