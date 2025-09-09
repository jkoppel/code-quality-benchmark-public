#!/usr/bin/env node
import * as path from "node:path";
import {
  TestRunner,
  type TestRunnerConfig,
} from "./benchmark-functionality-tests/test-lib/runner.js";
import { loadSuiteGenerationStrategy } from "./benchmark-functionality-tests/test-lib/test-registry.js";
import { Logger } from "./utils/logger/logger.js";

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
    if (results.summary.failed > 0) {
      logger.error(
        `✗ Suite "${results.name}" failed: ${results.summary.failed}/${results.summary.total} tests failed`,
      );

      // Log each failing test
      const failedTests = results.results.filter(
        (r) => r.outcome.status === "failed",
      );
      failedTests.forEach((test) => {
        if (test.outcome.status === "failed") {
          logger.error(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else if (results.summary.skipped > 0) {
      logger.warn(`⊘ ${results.summary.skipped} test(s) were skipped`);
      const skippedTests = results.results.filter(
        (r) => r.outcome.status === "skipped",
      );
      skippedTests.forEach((test) => {
        if (test.outcome.status === "skipped") {
          logger.warn(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else {
      logger.info(`✓ All tests in suite ${results.name} passed`);
    }
    logger.info(JSON.stringify(results, null, 2));

    logger.info(
      `Test execution for ${results.name} completed in ${(results.summary.duration / 1000).toFixed(1)}s`,
    );
  } catch (error) {
    logger.error(`Failed to run tests: ${String(error)}`);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
