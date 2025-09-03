import unimplemented from "ts-unimplemented";
import type { z } from "zod";
import { Logger } from "../../utils/logger";
import type { DriverAgent, DriverAgentConfig } from "./driver-agent";
import {
  NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS,
  VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS,
} from "./driver-agent";
import type { TestResult } from "./report";
import type { SutConfig } from "./runner";

/*************************************
  Test Case Agent
***************************************/

/** Each test case gets a new instance of the TestCaseAgent */
export interface TestCaseAgent {
  check(instructions: string): Promise<TestResult>;
  query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>>;
}

// TODO: Either have different query methods for whether to use vision-enabled Playwright, or have different TestCaseAgents

class BaseTestCaseAgent {
  private sessionId?: string;

  constructor(
    private readonly sutConfig: SutConfig,
    private readonly driver: DriverAgent,
    // TODO: Add a child method to our Logger wrapper...
    private readonly logger: Logger,
  ) {}

  // TODO: session mgmt
  async query<T extends z.ZodTypeAny>(
    prompt: string,
    outputSchema: T,
    driverConfig: DriverAgentConfig,
  ): Promise<z.infer<T>> {
    return unimplemented();
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }
}

export class NonVisionTestCaseAgent extends BaseTestCaseAgent implements TestCaseAgent {
  constructor(sutConfig: SutConfig, driver: DriverAgent, logger: Logger = Logger.getInstance()) {
    super(sutConfig, driver, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  override async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return super.query(prompt, outputSchema, NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS);
  }
}

export class VisionTestCaseAgent extends BaseTestCaseAgent implements TestCaseAgent {
  constructor(sutConfig: SutConfig, driver: DriverAgent, logger: Logger = Logger.getInstance()) {
    super(sutConfig, driver, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    return unimplemented();
  }

  async query<T extends z.ZodTypeAny>(prompt: string, outputSchema: T): Promise<z.infer<T>> {
    return super.query(prompt, outputSchema, VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS);
  }
}
