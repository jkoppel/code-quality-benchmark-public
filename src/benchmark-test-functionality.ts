#!/usr/bin/env node
import * as path from "node:path";
import { command, number, option, positional, run, string } from "cmd-ts";
import { Reporter } from "./benchmark-functionality-tests/test-lib/report.ts";
import {
  TestRunner,
  TestRunnerConfig,
} from "./benchmark-functionality-tests/test-lib/runner.ts";
import { loadSuiteGenerationStrategy } from "./benchmark-functionality-tests/test-lib/test-registry.ts";
import { getLoggerConfig } from "./utils/logger/logger.ts";

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
      short: "t",
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
    const { logger, logLevel } = getLoggerConfig();
    const config = new TestRunnerConfig(
      {
        folderPath: path.resolve(systemUnderTest),
        port,
      },
      { logger, logLevel },
      maxConcurrentTests,
    );

    try {
      validateTestRunnerConfig(config);
      const runner = new TestRunner(config);
      logger.info(`Started test runner with config\n${config.toPretty()}\n`);

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
  const sutConfig = config.getSutConfig();
  if (!(sutConfig.port >= 1 && sutConfig.port <= 65535))
    throw new Error(`Invalid port: ${sutConfig.port}`);
  if (!(config.getMaxConcurrentTests() >= 1))
    throw new Error(`max-concurrent-tests must be >= 1`);
}
