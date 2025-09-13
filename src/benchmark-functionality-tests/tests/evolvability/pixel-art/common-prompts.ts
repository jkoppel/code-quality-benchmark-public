import dedent from "dedent";
import type { TestRunnerConfig } from "../../../test-lib/runner.js";

export const makeBackgroundPrompt = (config: TestRunnerConfig) => dedent`
  You're testing a pixel art editor.
  You can also use Playwright MCP;
  the dev server has been started at port ${config.port}.`;
