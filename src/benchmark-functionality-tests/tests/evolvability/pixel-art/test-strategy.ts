import { TestContext } from "../../../test-lib/context.js";
import type { SuiteGenerationStrategy } from "../../../test-lib/suite.js";
import { Suite } from "../../../test-lib/suite.js";
import {
  basicRgbColorSelection,
  colorPickerStatePersistence,
  colorSharingMultiPane,
  independentDrawingAreas,
} from "./test-cases.js";

export const strategy: SuiteGenerationStrategy = {
  // biome-ignore lint/suspicious/useAwait: this is a no-op
  async discover() {
    // No discovery needed for these static tests
    return new TestContext(new Map());
  },

  // biome-ignore lint/suspicious/useAwait: This generateSuite doesn't need to be async, but there could be SuiteGenerationStrategies with generateSuites that do need to be async
  async generateSuite() {
    const staticTests = [
      basicRgbColorSelection,
      colorSharingMultiPane,
      colorPickerStatePersistence,
      independentDrawingAreas,
    ];

    return new Suite("Pixel Art Functionality Tests", staticTests);
  },
};

export default strategy;
