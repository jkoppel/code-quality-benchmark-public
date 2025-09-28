import { Effect } from "effect";
import { TestContext } from "../../../../harness/benchmark-test-lib/context.ts";
import type { SuiteGenerationStrategy } from "../../../../harness/benchmark-test-lib/suite.ts";
import { Suite } from "../../../../harness/benchmark-test-lib/suite.ts";
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
  discover() {
    // No discovery needed for these static tests
    return Effect.succeed(new TestContext(new Map()));
  },

  generateSuite() {
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

    return Effect.succeed(
      new Suite("Pixel Art Functionality Tests", staticTests),
    );
  },
};

export default strategy;
