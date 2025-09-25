import { TestContext } from "../../../../src/benchmark-functionality-tests/test-lib/context.ts";
import type { SuiteGenerationStrategy } from "../../../../src/benchmark-functionality-tests/test-lib/suite.ts";
import { Suite } from "../../../../src/benchmark-functionality-tests/test-lib/suite.ts";
import {
  basicColorPickerRgbSelection,
  basicMultiPaneCreation,
  bitmapLoadingIsolation,
  bitmapSaveLoad,
  colorSelectionSharedAcrossPanes,
  colorSelectionSurvivesPaneOps,
  drawingAreaIndependence,
} from "./test-cases.ts";

export const strategy: SuiteGenerationStrategy = {
  // biome-ignore lint/suspicious/useAwait: this is a no-op
  async discover() {
    // No discovery needed for these static tests
    return new TestContext(new Map());
  },

  // biome-ignore lint/suspicious/useAwait: This generateSuite doesn't need to be async, but there could be SuiteGenerationStrategies with generateSuites that do need to be async
  async generateSuite() {
    const staticTests = [
      // Multiple Panes
      basicMultiPaneCreation,

      // Color Picker Tests
      basicColorPickerRgbSelection,
      colorSelectionSharedAcrossPanes,
      colorSelectionSurvivesPaneOps,

      // Drawing Area Tests
      drawingAreaIndependence,

      // Bitmap Loading/Saving Tests
      bitmapSaveLoad,
      bitmapLoadingIsolation,
    ];

    return new Suite("Pixel Art Functionality Tests", staticTests);
  },
};

export default strategy;
