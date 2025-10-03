import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../../harness/benchmark-test-lib/common-prompts.ts";
import type { SutConfig } from "../../../../harness/benchmark-test-lib/runner.ts";

/***************************************
      makeBackgroundPrompt helper
****************************************/

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
  You're testing a room booking application.
  ${makeBaseToolsPrompt(config)}`;
