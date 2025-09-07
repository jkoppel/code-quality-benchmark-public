import type * as z from "zod";
import { Logger } from "../../utils/logger.js";
import { DriverAgent } from "./driver-agent.js";
import type { SutConfig } from "./runner.js";
// TODO: Make a separate fixture agent config?
import { VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG } from "./test-case-agent.js";

export interface FixtureMaker {
  id: string;
  initialize(agent: FixtureAgent): Promise<unknown>;
}

export class FixturesEnv {
  constructor(private fixtures: Map<string, unknown>) {}

  get(key: string): unknown {
    return this.fixtures.get(key);
  }

  set(key: string, value: unknown): void {
    this.fixtures.set(key, value);
  }
}

/*************************************
  Fixture Agent
***************************************/

const FIXTURE_AGENT_CONFIG = {
  ...VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG,
};

// TODO: Add prompt with info about vision caps
export class FixtureAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(
      {
        ...FIXTURE_AGENT_CONFIG,
        cwd: sutConfig.folderPath,
      },
      logger,
    );
  }

  // TODO: can think about limiting what tools agent can get
  async query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
  ): Promise<z.infer<T>> {
    return await this.driver.query(prompt, outputSchema);
  }
}
