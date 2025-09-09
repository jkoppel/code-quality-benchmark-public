import type * as z from "zod";
import { Logger } from "../../utils/logger/logger.js";
import { DriverAgent } from "./driver-agent.js";
import type { SutConfig } from "./runner.js";
// TODO: Make a separate fixture agent config?
import { VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG } from "./test-case-agent.js";

const DISCOVERY_AGENT_CONFIG = {
  ...VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG,
};

// TODO: Add prompt with info about vision caps
export class DiscoveryAgent {
  private driver: DriverAgent;
  constructor(
    private readonly sutConfig: SutConfig,
    private readonly logger: Logger = Logger.getInstance(),
  ) {
    this.driver = new DriverAgent(
      {
        ...DISCOVERY_AGENT_CONFIG,
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
