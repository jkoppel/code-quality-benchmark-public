import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../../../harness/benchmark-test-lib/common-prompts.ts";
import type { SutConfig } from "../../../../../harness/benchmark-test-lib/runner.ts";

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
    You're testing a Todolist app.
    ${makeBaseToolsPrompt(config)}`;
