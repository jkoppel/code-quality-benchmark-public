import type { SutConfig } from "./runner.ts";

export const makeBaseToolsPrompt = (config: SutConfig) =>
  `You can use Playwright MCP; the dev server has been started at port ${config.port} (no need to start a new instance).`;
