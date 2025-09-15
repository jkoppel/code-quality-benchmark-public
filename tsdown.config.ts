import { defineConfig } from "tsdown";
import { TEST_STRATEGY_REGISTRY } from "./src/benchmark-functionality-tests/test-lib/test-registry.ts";

const testStrategyFiles = Object.values(TEST_STRATEGY_REGISTRY).map((path) =>
  path
    .replace(
      "./benchmark-functionality-tests/",
      "./src/benchmark-functionality-tests/",
    )
    .replace(".js", ".ts"),
);

export default defineConfig({
  entry: [
    "./src/index.ts",
    // Benchmark scripts
    "./src/benchmark-runner.ts",
    "./src/benchmark-runner-existing.ts",
    "./src/benchmark-test-functionality.ts",
    // Test strategy files -- need to include them here
    // because they are dynamically imported and are not otherwise reachable from the other entry points
    ...testStrategyFiles,
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  platform: "node",
  target: "es2022",
});
