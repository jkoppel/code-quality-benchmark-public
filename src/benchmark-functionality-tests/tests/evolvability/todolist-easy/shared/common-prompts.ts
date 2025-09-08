import type { SutConfig } from "../../../../test-lib/runner.js";
import dedent from "dedent";

export const makeToolsInfoPrompt = (config: SutConfig) => dedent`
  You have access to the app's code in this directory; you can also use Playwright MCP.
  The dev server has been started at port ${config.port}.`;

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
    You're testing a Todolist app.
    ${makeToolsInfoPrompt(config)}`;
