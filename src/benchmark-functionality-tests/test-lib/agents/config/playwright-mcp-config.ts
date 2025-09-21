import type { TestRunnerConfig } from "../../runner.ts";

export type PlaywrightMCPCapability = "verify" | "vision";

const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.38";

export function makePlaywrightMCPConfig(
  capabilities: PlaywrightMCPCapability[],
  testRunnerConfig: TestRunnerConfig,
) {
  const args = [
    "-y",
    PLAYWRIGHT_MCP,
    "--isolated",
    testRunnerConfig.getPlaywrightBrowserModeFlag(),
  ];

  // Save output (traces, session) if an output dir path was provided
  const outputDir = testRunnerConfig.getPlaywrightOutDir();
  if (outputDir) {
    args.push("--output-dir", outputDir, "--save-trace", "--save-session");
  }

  if (capabilities.length > 0) {
    args.push(`--caps=${capabilities.join(",")}`);
  }

  return {
    playwright: {
      type: "stdio" as const,
      command: "npx",
      args,
    },
  };
}
