import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../../test-lib/common-prompts.js";
import type { SutConfig } from "../../../../test-lib/runner.js";

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
    You're testing a Todolist app.
    ${makeBaseToolsPrompt(config)}`;
