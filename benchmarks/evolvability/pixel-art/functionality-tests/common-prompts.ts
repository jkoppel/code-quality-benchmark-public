import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../../harness/benchmark-functionality-tests/test-lib/common-prompts.ts";
import type { SutConfig } from "../../../../harness/benchmark-functionality-tests/test-lib/runner.ts";

/***************************************
      makeBackgroundPrompt helper
****************************************/

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
  You're testing a pixel art editor.
  ${makeBaseToolsPrompt(config)}`;
