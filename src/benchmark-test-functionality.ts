#!/usr/bin/env node
import * as path from "path";
import {
  DriverAgent,
  NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS,
} from "./benchmark-functionality-tests/test-lib/driver-agent.js";
import { TestRunner, type TestRunnerConfig } from "./benchmark-functionality-tests/test-lib/runner.js";
import { loadTestSuite } from "./benchmark-functionality-tests/test-lib/suite.js";
import { Logger } from "./utils/logger.js";

async function main() {
  const benchmarkPath = process.argv[2];
  const systemUnderTest = process.argv[3];

  if (!benchmarkPath || !systemUnderTest) {
    console.error("Usage: benchmark:test-functionality <benchmark-path> <attempt-at-benchmark>");
    console.error(
      "Example: benchmark-runner-existing benchmarks/evolvability/calculator /tmp/benchmark-xxx/original-program",
    );
    process.exit(1);
  }

  const resolvedBenchmarkPath = path.resolve(benchmarkPath);
  const resolvedSystemUnderTest = path.resolve(systemUnderTest);
  const logger = Logger.getInstance();

  try {
    // Initialize test runner configuration
    const config: TestRunnerConfig = {
      sutConfig: {
        folderPath: resolvedSystemUnderTest,
        port: 3000, // TODO: Is this rly where we shld be specifying the port?
      },
    };

    // Initialize driver agent and test runner
    const driverAgent = new DriverAgent(NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_OPTIONS, logger);
    const testRunner = new TestRunner(config, driverAgent, logger);

    // Load test suite
    logger.info(`Loading functional test suite for ${resolvedBenchmarkPath}`);
    const suite = await loadTestSuite(resolvedBenchmarkPath);

    // Run test suite
    logger.info(`Running suite: ${suite.getName()}`);
    const result = await testRunner.runTestSuite(suite);

    // Handle result
    logger.info(`✓ Suite "${suite.getName()}" completed successfully`);
    console.log(JSON.stringify(result, null, 2));

    logger.info("Test execution completed");
  } catch (error) {
    logger.error(`Failed to run tests: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
