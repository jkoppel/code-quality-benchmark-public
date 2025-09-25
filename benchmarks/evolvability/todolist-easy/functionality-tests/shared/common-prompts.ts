import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../../../src/benchmark-functionality-tests/test-lib/common-prompts.ts";
import type { SutConfig } from "../../../../../src/benchmark-functionality-tests/test-lib/runner.ts";

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
    You're testing a Todolist app.
    ${makeBaseToolsPrompt(config)}`;
