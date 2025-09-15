import dedent from "dedent";
import { makeBaseToolsPrompt } from "../../../test-lib/common-prompts.js";
import type { SutConfig } from "../../../test-lib/runner.js";

/***************************************
      makeBackgroundPrompt helper
****************************************/

export const makeBackgroundPrompt = (config: SutConfig) => dedent`
  You're testing a pixel art editor.
  ${makeBaseToolsPrompt(config)}`;
