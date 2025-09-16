import dedent from "dedent";
import type {
  OptionalTestCaseAgentCapability,
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../test-lib/agents/test-case-agent.ts";
import type { TestContext } from "../../../test-lib/context.ts";
import type { TestResult } from "../../../test-lib/report.ts";
import type { TestRunnerConfig } from "../../../test-lib/runner.ts";
import type { TestCase } from "../../../test-lib/suite.ts";
import { makeBackgroundPrompt } from "./common-prompts.ts";

/***************************************
         Test Cases
****************************************/

export const basicRgbColorSelection = makeTest({
  name: "Basic Functionality: RGB Color Selection",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Test basic color picker functionality with a single pane -- is there an RGB color picker; can users select colors with it?

      Steps:
      1. Use the color selection capability to set a red color (don't need to be super precise -- don't waste turns on slider issues)
      2. Draw a pixel with it
      3. Check that (i) the selected color indicator, if there's one, shows red and (ii) the drawing area shows a red pixel
      4. Use the color selection capability to set some shade of green (don't need to be super precise)
      5. Draw a pixel with it
      6. Check that (i) the selected color indicator, if there's one, shows green and (ii) the drawing area shows a green pixel

      Mark the test as failing if any only if any of the above checks fail.
      The test passes if all the above checks pass.`);
  },
});

export const colorSharingMultiPane = makeTest({
  name: "Color Sharing with Multiple Panes",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Verify that color selection applies globally across multiple panes

      Steps:
      1. Create two editing panes
      2. Pick some shade of red (no need to be super precise)
      3. Click in first pane's drawing area to paint a pixel
      4. Click in second pane's drawing area to paint a pixel
      5. Take screenshot(s); check that the pixels are red in both panes -- fail the test if not.
      6. Now set color to green (no need to be super precise)
      7. Paint pixels in both panes again
      8. Take screenshot(s); check that the pixels are green in both panes -- fail the test if not.

      Mark the test as passing if all the checks above pass; i.e., if color selection is shared across all panes.
      `);
  },
});

// TODO: check/read more carefully
export const colorPickerStatePersistence = makeTest({
  name: "Color Picker State Persistence",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Verify color selection survives pane creation/deletion operations

      Steps:
      1. Make sure there's one pane to begin with (if not, create one).
      2. Select a distinctive color, call it $COLOR. This will be fixed for the rest of the test.
      3. Create a second pane.
      4. Verify that $COLOR is still active in the color picker -- fail the test if not.
      5. Close the first pane.
      6. Paint a pixel in the remaining pane to confirm that the color picker is still on $COLOR (i.e., the color of the painted pixel should still be $COLOR) -- fail the test if not.

      Mark the test as passing if all the checks above pass; i.e., if the color selection persists through pane creation and deletion.
      Mark as failing if any of the checks fail.`);
  },
});

// TODO: check/read more carefully
export const independentDrawingAreas = makeTest({
  name: "Independent Drawing Areas",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Verify drawing in one pane doesn't affect other panes

      Steps:
      1. Select a distinctive color
      2. Make exactly two panes.
      3. Draw several pixels in first pane creating a recognizable pattern
      4. Check that the second pane remains unchanged -- fail the test if not.
      5. Draw a different pattern in the second pane with a different color
      6. Verify first pane's pattern is unaffected -- fail the test if not.

      Mark the test as passing if drawing in one pane doesn't affect other panes;
      mark it as failing if not.`);
  },
});

// TODO: Check also that laoding / saving bitmap in one pane doesn't affect what bitmap is active in the other pane

/***************************************
         makeTest helper
****************************************/

interface PixelArtTestOptions {
  name: string;
  run(agent: TestCaseAgent, config: TestRunnerConfig): Promise<TestResult>;
}

const capabilitiesForPixelArtTests: OptionalTestCaseAgentCapability[] = [
  "vision",
];

function makeTest({ name, run }: PixelArtTestOptions): TestCase {
  return {
    descriptiveName: name,
    async run(
      makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
      _context: TestContext,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const agent = makeAgent({
        additionalCapabilities: capabilitiesForPixelArtTests,
      });
      return await run(agent, config);
    },
  };
}
