import type { TestRunnerConfig } from "../../runner.ts";

export type PlaywrightMCPCapability = "verify" | "vision";

const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.38";

export function makePlaywrightMCPConfig(
  capabilities: PlaywrightMCPCapability[],
  testRunnerConfig: TestRunnerConfig,
) {
  return {
    playwright: {
      type: "stdio" as const,
      command: "npx",
      args: [
        "-y",
        PLAYWRIGHT_MCP,
        "--isolated",
        "--save-trace",
        "--save-session",
        testRunnerConfig.getPlaywrightBrowserModeFlag(),
        capabilities.length > 0 ? `--caps=${capabilities.join(",")}` : "",
      ],
    },
  };
}
