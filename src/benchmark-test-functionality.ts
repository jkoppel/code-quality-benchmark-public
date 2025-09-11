#!/usr/bin/env node
import * as path from "node:path";
import { command, positional, option, run, string, number } from "cmd-ts";
import { Reporter } from "./benchmark-functionality-tests/test-lib/report.js";
import {
  TestRunner,
  type TestRunnerConfig,
} from "./benchmark-functionality-tests/test-lib/runner.js";
import { loadSuiteGenerationStrategy } from "./benchmark-functionality-tests/test-lib/test-registry.js";
import { Logger } from "./utils/logger/logger.js";

const cmd = command({
  name: "benchmark-test-functionality",
  description: "Run functionality tests against an attempt at a benchmark task",
  args: {
    benchmarkPath: positional({
      type: string,
      displayName: "benchmark-path",
      description:
        "Path to the benchmark *task* dir (e.g., benchmarks/evolvability/calculator)",
    }),
    systemUnderTest: positional({
      type: string,
      displayName: "attempt-at-benchmark",
      description:
        "Path to the dir of the benchmark attempt to be tested (e.g., /tmp/benchmark-xxx/original-program)",
    }),
    port: option({
      type: number,
      long: "port",
      short: "p",
      description: "Port to use for the dev server",
      defaultValue: () => 3000,
    }),
    maxConcurrentTests: option({
      type: number,
      long: "max-concurrent-tests",
      short: "c",
      description: "Max number of test cases to run concurrently",
      defaultValue: () => 4,
    }),
  },
  handler: async ({
    benchmarkPath,
    systemUnderTest,
    port,
    maxConcurrentTests,
  }) => {
    const resolvedBenchmarkPath = path.resolve(benchmarkPath);
    const logger = Logger.getInstance();
    const config: TestRunnerConfig = {
      folderPath: path.resolve(systemUnderTest),
      port,
      logger,
      maxConcurrentTests,
    };

    try {
      validateTestRunnerConfig(config);
      const runner = new TestRunner(config);

      // Load test suite generation strategy
      logger.info(
        `Loading test suite generation strategy for ${resolvedBenchmarkPath}`,
      );
      const strategy = await loadSuiteGenerationStrategy(resolvedBenchmarkPath);

      // Execute suite generation strategy
      logger.info(`Executing suite generation strategy`);
      const results = await runner.executeStrategy(strategy);

      // Handle result
      const reporter = new Reporter(logger);
      reporter.report(results);
    } catch (error) {
      const msg =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      logger.error(`Failed to run tests:\n${msg}`);
      throw error; // rethrow so top-level sets exit code
    }
  },
});

run(cmd, process.argv.slice(2)).catch(() => {
  process.exit(1);
});

function validateTestRunnerConfig(config: TestRunnerConfig) {
  if (!(config.port >= 1 && config.port <= 65535))
    throw new Error(`Invalid port: ${config.port}`);
  if (!(config.maxConcurrentTests >= 1))
    throw new Error(`max-concurrent-tests must be >= 1`);
}
