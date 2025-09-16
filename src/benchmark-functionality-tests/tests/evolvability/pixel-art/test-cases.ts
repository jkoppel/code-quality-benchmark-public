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
         Color Selection Tests
****************************************/

export const basicColorPickerRgbSelection = makeTest({
  name: "Basic Color Picker functionality",
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

export const colorSelectionSharedAcrossPanes = makeTest({
  name: "Color selection is shared across multiple panes",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Verify that color selection applies globally across multiple panes

      Steps:
      1. Create two editing panes
      (It may help to tweak the browser viewport to make it easy to see both panes at once.)
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
export const colorSelectionSurvivesPaneOps = makeTest({
  name: "Color selection survives pane creation/deletion operations",
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
      (It may help to tweak the browser viewport to make it easy to see both panes at once.)
      4. Verify that $COLOR is still active in the color picker -- fail the test if not.
      5. Close the first pane.
      6. Paint a pixel in the remaining pane to confirm that the color picker is still on $COLOR (i.e., the color of the painted pixel should still be $COLOR) -- fail the test if not.

      Mark the test as passing if all the checks above pass; i.e., if the color selection persists through pane creation and deletion.
      Mark as failing if any of the checks fail.`);
  },
});

/***************************************
         Multiple Panes
****************************************/

export const basicMultiPaneCreation = makeTest({
  name: "Basic Multi-Pane Creation",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Check that it's possible to create more than one pane

      Steps:
      1. If there isn't already one pane, create one. Fail the test if it's not possible to have any panes at all.
      2. Create a second pane.
      (It may help to tweak the browser viewport to make it easy to see both panes at once.)

      Mark the test as passing if it's possible to have two panes, and failing if not.`);
  },
});

/***************************************
         Drawing Area Tests
****************************************/

// TODO: check/read more carefully
export const drawingAreaIndependence = makeTest({
  name: "Drawing Area Independence",
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
      (It may help to tweak the browser viewport to make it easy to see both panes at once.)
      3. Draw several pixels in first pane creating a recognizable pattern
      4. Check that the second pane remains unchanged -- fail the test if not.
      5. Draw a different pattern in the second pane with a different color
      6. Verify first pane's pattern is unaffected -- fail the test if not.

      Mark the test as passing if drawing in one pane doesn't affect other panes;
      mark it as failing if not.`);
  },
});

/***************************************
         Bitmap Operation Tests
****************************************/

export const bitmapSaveLoad = makeTest({
  name: "Bitmap Save and Load",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      
      Objective: Check basic bitmap saving and loading functionality
      
      Steps:
      1. Make two panes.
      (It may help to tweak the browser viewport to make it easy to see both panes at once.)
      2. Make a distinctive pattern in the first pane.
      3. Save the bitmap in the first pane (if there is no bitmap saving functionality, fail the test)
      4. Load the bitmap in the second pane (if there is no bitmap loading functionality, fail the test)
      5. Take a screenshot and check that the loaded bitmap in the second pane looks like the one in the first pane; fail the test if not.`);
  },
});

export const bitmapLoadingIsolation = makeTest({
  name: "Bitmap Loading Isolation",
  async run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      
      Objective: Verify loading bitmap in one pane doesn't affect what happens in another pane
      
      Steps:
      1. Create three panes. 
      (It may also help to tweak the browser viewport to make it easy to see all the panes at once.)
      2. Make a distinctive pattern in the first pane.
      3. Save the bitmap in the first pane (if there is no bitmap saving functionality, fail the test)
      4. Load the bitmap in the second pane (if there is no bitmap loading functionality, fail the test)
      5. Take a screenshot and check that the third pane hasn't changed because a bitmap was loaded into the second pane; fail the test if loading a bitmap in one pane affects another pane.`);
  },
});

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
