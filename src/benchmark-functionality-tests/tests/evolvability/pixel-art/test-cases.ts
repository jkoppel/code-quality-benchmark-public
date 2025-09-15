import dedent from "dedent";
import type {
  OptionalTestCaseAgentCapability,
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../test-lib/agents/test-case-agent.js";
import type { TestContext } from "../../../test-lib/context.js";
import type { TestResult } from "../../../test-lib/report.js";
import type { TestRunnerConfig } from "../../../test-lib/runner.js";
import type { TestCase } from "../../../test-lib/suite.js";
import { makeBackgroundPrompt } from "./common-prompts.js";

const capabilitiesForPixelArtTests: OptionalTestCaseAgentCapability[] = [
  "vision",
];

export const basicRgbColorSelection: TestCase = {
  descriptiveName: "Test CS001: RGB Color Selection Basic Functionality",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    _context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({
      additionalCapabilities: capabilitiesForPixelArtTests,
    });
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      
      Test CS001: RGB Color Selection Basic Functionality
      
      Objective: Verify that users can select colors using the available color selection capability
      
      Steps:
      1. Launch the application
      2. Use the color selection capability to set pure red (R=255, G=0, B=0)
      3. Observe that the selected color indicator shows red
      4. Use the color selection capability to set pure green (R=0, G=255, B=0)
      5. Observe that the selected color indicator shows green
      6. Use the color selection capability to set pure blue (R=0, G=0, B=255)
      7. Observe that the selected color indicator shows blue
      
      Expected Result: Color selection capability allows setting RGB values and displays corresponding colors
      
      Mark the test as passing if the color selection works for all three primary colors (red, green, blue).
      Mark as failing if any color cannot be selected or the indicator doesn't show the correct color.`);
  },
};

export const colorSharingMultiPane: TestCase = {
  descriptiveName: "Color Sharing with Multiple Panes",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    _context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({
      additionalCapabilities: capabilitiesForPixelArtTests,
    });
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}

      Objective: Verify that color selection applies globally across all panes

      Steps:
      1. Create two editing panes
      2. Set color to red by clicking at the right end of red slider and left end of green/blue sliders (no need to be super precise)
      3. Click in first pane's drawing area to paint a pixel
      4. Click in second pane's drawing area to paint a pixel
      5. Take screenshot(s)
      6. Set color to green by clicking at the left end of red slider, right end of green slider, and left end of blue slider
      7. Paint pixels in both panes again
      8. Take screenshot(s)

      Expected Result:
      - First painting operation uses red color in both panes
      - Second painting operation uses green color in both panes
      - Color changes affect all panes simultaneously

      Mark the test as passing if color selection is shared across all panes.
      Mark as failing if different panes use different colors or color changes don't affect all panes.

      Make sure to take screenshots and corroborate your conclusions against them -- it's not enough to rely on the DOM snapshots.
      `);
  },
};

// TODO: check/read more carefully
export const colorPickerStatePersistence: TestCase = {
  descriptiveName: "Color Picker State Persistence",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    _context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({
      additionalCapabilities: capabilitiesForPixelArtTests,
    });
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      
      Objective: Verify color selection survives pane creation/deletion operations  
      
      Steps:
      1. Launch application with single pane
      2. Select a distinctive color.
      3. Create new pane
      4. Verify selected color is still active in color picker
      5. Close one pane (not the last one)
      6. Verify selected color is still active in remaining pane
      7. Paint pixel to confirm color is still usable
      
      Expected Result: Color selection persists through pane management operations
      
      Mark the test as passing if the color selection persists through pane creation and deletion.
      Mark as failing if the color selection is lost or changes during pane operations.`);
  },
};

// TODO: check/read more carefully
export const independentDrawingAreas: TestCase = {
  descriptiveName: "Independent Drawing Areas",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    _context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({
      additionalCapabilities: capabilitiesForPixelArtTests,
    });
    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      
      Objective: Verify drawing in one pane doesn't affect other panes
      Pre-condition: Application with at least 2 panes open
      
      Steps:
      1. Select a distinctive color
      2. Draw several pixels in first pane creating a recognizable pattern
      3. Observe second pane remains unchanged
      4. Draw different pattern in second pane with a different color
      5. Verify first pane's pattern is unaffected
      
      Expected Result:
      - Drawing operations in each pane are completely isolated
      - No cross-contamination between pane contents
      - Each pane maintains its own independent drawing state
      
      Mark the test as passing if drawing in one pane doesn't affect other panes.
      Mark as failing if drawing operations affect multiple panes.`);
  },
};
