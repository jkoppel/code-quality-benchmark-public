import { defineConfig } from "tsdown";
import {
  discoverBenchmarksWithTests,
  getTestStrategyGlobPattern,
} from "./harness/benchmark-test-lib/test-registry.ts";

// Log what test strategies are being included in the build for debugging
const testStrategies = discoverBenchmarksWithTests();
console.log("------------------------------------------------------------");
console.log(
  `Including ${testStrategies.length} functionality test suites in build:`,
);
testStrategies.forEach(({ benchmarkSet, project, testDir }) => {
  console.log(`  - ${benchmarkSet}/${project}/${testDir}`);
});
console.log("------------------------------------------------------------");

export default defineConfig({
  entry: [
    "./harness/index.ts",

    // Unified CLI
    "./harness/benchmark-cli.ts",

    // Test strategy files - using convention-based glob pattern
    `./${getTestStrategyGlobPattern()}`,
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  platform: "node",
  target: "es2022",
});
