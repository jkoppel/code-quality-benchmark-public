#!/usr/bin/env node
import * as path from "node:path";
import {
  TestRunner,
  type TestRunnerConfig,
} from "./benchmark-functionality-tests/test-lib/runner.js";
import { loadSuiteGenerationStrategy } from "./benchmark-functionality-tests/test-lib/test-registry.js";
import { Logger } from "./utils/logger/logger.js";
import { Reporter } from "./benchmark-functionality-tests/test-lib/report.js";

async function main() {
  const benchmarkPath = process.argv[2];
  const systemUnderTest = process.argv[3];

  if (!benchmarkPath || !systemUnderTest) {
    console.error(
      "Usage: npm run benchmark:test-functionality <benchmark-path> <attempt-at-benchmark>",
    );
    console.error(
      "Example: npm run benchmark:test-functionality benchmarks/evolvability/calculator /tmp/benchmark-xxx/original-program",
    );
    process.exit(1);
  }

  const resolvedBenchmarkPath = path.resolve(benchmarkPath);
  const resolvedSystemUnderTest = path.resolve(systemUnderTest);
  const logger = Logger.getInstance();

  try {
    const config: TestRunnerConfig = {
      folderPath: resolvedSystemUnderTest,
      port: 3000,
      logger,
    };
    const testRunner = new TestRunner(config);

    // Load test suite generation strategy
    logger.info(
      `Loading test suite generation strategy for ${resolvedBenchmarkPath}`,
    );
    const strategy = await loadSuiteGenerationStrategy(resolvedBenchmarkPath);

    // Execute suite generation strategy
    logger.info(`Executing suite generation strategy`);
    const results = await testRunner.executeStrategy(strategy);

    // Handle result
    const reporter = new Reporter(logger);
    reporter.report(results);
  } catch (error) {
    logger.error(`Failed to run tests: ${String(error)}`);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
