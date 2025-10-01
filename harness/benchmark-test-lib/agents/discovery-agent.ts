import type { Effect } from "effect";
import type * as z from "zod";
import type { LoggerConfig } from "../../utils/logger/logger.ts";
import type { SutConfig, TestRunnerConfig } from "../runner.ts";
import { BASE_CONFIG } from "./config/base-driver-agent-config.ts";
import { makePlaywrightMCPConfig } from "./config/playwright-mcp-config.ts";
import { DriverAgent, type DriverAgentError } from "./driver-agent.ts";

export class DiscoveryAgent {
  static make(testRunnerConfig: TestRunnerConfig): DiscoveryAgent {
    const driverConfig = {
      ...BASE_CONFIG,
      mcpServers: makePlaywrightMCPConfig(["vision"], testRunnerConfig),
      cwd: testRunnerConfig.getSutFolderPath(),
    };

    return new DiscoveryAgent(
      testRunnerConfig.getSutConfig(),
      new DriverAgent(driverConfig),
    );
  }

  private constructor(
    readonly sutConfig: SutConfig,
    private readonly driver: DriverAgent,
  ) {}

  // TODO: can think about limiting what tools agent can get
  query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
  ): Effect.Effect<z.infer<T>, DriverAgentError, LoggerConfig> {
    return this.driver.query(prompt, outputSchema);
  }
}
