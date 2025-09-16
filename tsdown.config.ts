import { defineConfig } from "tsdown";
import { TEST_STRATEGY_REGISTRY } from "./src/benchmark-functionality-tests/test-lib/test-registry.ts";

const testStrategyFiles = Object.values(TEST_STRATEGY_REGISTRY).map((path) => {
  const [registryRelativePath, projectRelativePath] = [
    "./benchmark-functionality-tests/",
    "./src/benchmark-functionality-tests/",
  ];
  return path.replace(registryRelativePath, projectRelativePath).concat(".ts");
});

export default defineConfig({
  entry: [
    "./src/index.ts",

    // Benchmark scripts
    "./src/benchmark-runner.ts",
    "./src/benchmark-runner-existing.ts",
    "./src/benchmark-test-functionality.ts",

    // Test strategy files -- need to include them here
    // because they are not otherwise reachable from the other entry points (they are dynamically imported)
    ...testStrategyFiles,
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  platform: "node",
  target: "es2022",
});
