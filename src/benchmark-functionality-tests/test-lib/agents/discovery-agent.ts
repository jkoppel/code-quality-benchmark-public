import type * as z from "zod";
import { getLoggerConfig, type Logger } from "../../../utils/logger/logger.js";
import type { SutConfig } from "../runner.js";
import { BASE_CONFIG } from "./config/base-driver-agent-config.js";
import { makePlaywrightMCPConfig } from "./config/playwright-mcp-config.js";
import { DriverAgent, makeDriverAgentConfig } from "./driver-agent.js";

export class DiscoveryAgent {
  static make(sutConfig: SutConfig, logger?: Logger): DiscoveryAgent {
    const driverConfig = makeDriverAgentConfig(
      BASE_CONFIG,
      makePlaywrightMCPConfig(["vision"]),
      sutConfig,
    );
    return new DiscoveryAgent(
      sutConfig,
      new DriverAgent(driverConfig, logger),
      logger,
    );
  }

  constructor(
    readonly sutConfig: SutConfig,
    private readonly driver: DriverAgent,
    private readonly logger: Logger = getLoggerConfig().logger,
  ) {}

  // TODO: can think about limiting what tools agent can get
  async query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
  ): Promise<z.infer<T>> {
    return await this.driver.query(prompt, outputSchema);
  }
}
