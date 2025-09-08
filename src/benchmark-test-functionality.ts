#!/usr/bin/env node
import * as path from "node:path";
import {
  TestRunner,
  type TestRunnerConfig,
} from "./benchmark-functionality-tests/test-lib/runner.js";
import { loadTestSuite } from "./benchmark-functionality-tests/test-lib/test-registry.js";
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

    // Load test suite
    logger.info(`Loading functional test suite for ${resolvedBenchmarkPath}`);
    const suite = await loadTestSuite(resolvedBenchmarkPath);

    // Run test suite
    logger.info(`Running suite: ${suite.getName()}`);
    const result = await testRunner.runTestSuite(suite);

    // Handle result
    if (result.summary.failed > 0) {
      logger.error(
        `✗ Suite "${suite.getName()}" failed: ${result.summary.failed}/${result.summary.total} tests failed`,
      );

      // Log each failing test
      const failedTests = result.results.filter(
        (r) => r.outcome.status === "failed",
      );
      failedTests.forEach((test) => {
        if (test.outcome.status === "failed") {
          logger.error(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else if (result.summary.skipped > 0) {
      logger.warn(`⊘ ${result.summary.skipped} test(s) were skipped`);
      const skippedTests = result.results.filter(
        (r) => r.outcome.status === "skipped",
      );
      skippedTests.forEach((test) => {
        if (test.outcome.status === "skipped") {
          logger.warn(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else {
      logger.info(`✓ All tests in suite ${suite.getName()} passed`);
    }
    logger.info(JSON.stringify(result, null, 2));

    logger.info(
      `Test execution for ${suite.getName()} completed in ${(result.summary.duration / 1000).toFixed(1)}s`,
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
