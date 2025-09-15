export type PlaywrightMCPCapability = "verify" | "vision";

export function makePlaywrightMCPConfig(
  capabilities: PlaywrightMCPCapability[],
) {
  const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.36";
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
        "--headless",
        capabilities.length > 0 ? `--caps=${capabilities.join(",")}` : "",
      ],
    },
  };
}
