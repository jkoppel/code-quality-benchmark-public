#!/usr/bin/env node

import * as path from "node:path";
import { Args, CliConfig, Command, HelpDoc, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Cause, Console, Effect, Layer, Option } from "effect";

import {
  runBenchmarkWithExistingCode,
  runBenchmarkWithNewCode,
} from "./benchmark-lib.ts";
import { Reporter } from "./benchmark-test-lib/report.ts";
import { TestRunner, TestRunnerConfig } from "./benchmark-test-lib/runner.ts";
import {
  discoverBenchmarksWithTests,
  loadSuiteGenerationStrategy,
} from "./benchmark-test-lib/test-registry.ts";
import { createShellAgent } from "./index.ts";
import { getLoggerConfig } from "./utils/logger/logger.ts";
import { checkDependenciesPresent } from "./utils/validate-dependencies.ts";

// TODO: Refactor the path args to use Effect's path args facilities (which also do validation)

// Shared arguments

const benchmarkPath = Args.text({
  name: "benchmark-path",
}).pipe(
  Args.withDescription(
    "Path to the benchmark task dir (e.g., benchmarks/evolvability/calculator)",
  ),
);

/* Subcommand: cqb test <benchmark-path> <system-under-test> [options] */
function makeTestSubCommand() {
  const systemUnderTest = Args.text({
    name: "system-under-test",
  }).pipe(
    Args.withDescription(
      "Path to the directory of the benchmark attempt to be tested (e.g., /tmp/benchmark-xxx/original-program)",
    ),
  );

  const port = Options.integer("port").pipe(
    Options.withAlias("p"),
    Options.withDefault(3000),
    Options.withDescription("Port to use for the dev server"),
  );
  const maxConcurrentTests = Options.integer("max-concurrent-tests").pipe(
    Options.withAlias("t"),
    Options.withDefault(4),
    Options.withDescription("Max number of test cases to run concurrently"),
  );
  const headed = Options.boolean("headed").pipe(
    Options.withDefault(false),
    Options.withDescription(
      "Run browser in headed mode (show browser window). Useful for debugging functionality tests",
    ),
  );

  // Requiring the user to provide a path if they want PW mcp to be saved (without a default dir),
  // to pre-empt potential data contamination/leakage issues from, e.g., unintentionally exposing PW MCP output to coding agents
  const playwrightOutDir = Options.text("playwright-out-dir").pipe(
    Options.withAlias("pw-out"),
    Options.optional,
    Options.withDescription(
      "Directory for Playwright MCP traces and sessions (won't save if not provided). Set this to inspect detailed browser interactions and network activity",
    ),
  );

  return Command.make("test", {
    benchmarkPath,
    systemUnderTest,
    port,
    maxConcurrentTests,
    headed,
    playwrightOutDir,
  }).pipe(
    Command.withDescription(
      "Run functionality tests against an attempt at a benchmark task",
    ),
    Command.withHandler(
      ({
        benchmarkPath,
        systemUnderTest,
        port,
        maxConcurrentTests,
        headed,
        playwrightOutDir,
      }) =>
        Effect.gen(function* () {
          const resolvedBenchmarkPath = path.resolve(benchmarkPath);
          const { logger, logLevel } = getLoggerConfig();

          yield* Console.log(`Running functionality tests`);
          yield* Console.log(`Benchmark: ${resolvedBenchmarkPath}`);
          yield* Console.log(`System under test: ${systemUnderTest}`);

          // Create test runner config
          const config = TestRunnerConfig.make(
            {
              folderPath: path.resolve(systemUnderTest),
              port,
            },
            { logger, logLevel },
            maxConcurrentTests,
            headed,
            Option.getOrUndefined(playwrightOutDir),
          );
          const runner = new TestRunner(config);
          logger.info(`Started test runner with config ${config.toPretty()}`);

          // Load test suite generation strategy
          logger.info(
            `Loading test suite generation strategy for ${resolvedBenchmarkPath}`,
          );
          const strategy = yield* Effect.promise(() =>
            loadSuiteGenerationStrategy(resolvedBenchmarkPath),
          );

          // Execute suite generation strategy
          logger.info(`Executing suite generation strategy`);
          const testResults = yield* runner.executeStrategy(strategy);

          // Report test results
          const reporter = new Reporter(logger);
          reporter.report(testResults);
        }),
    ),
  );
}

/* Subcommand: cqb run <benchmark-path> <agent-script-path> */
function makeRunFromScratchSubCommand() {
  const agentScriptPath = Args.text({
    name: "agent-script-path",
  }).pipe(
    Args.withDescription(
      "Path to the shell script that implements the coding agent",
    ),
  );

  return Command.make("run", { benchmarkPath, agentScriptPath }).pipe(
    Command.withDescription(
      "Run benchmark for a given project with a program that's generated from scratch by the supplied coding agent",
    ),
    Command.withHandler(({ benchmarkPath, agentScriptPath }) =>
      Effect.gen(function* () {
        const resolvedBenchmarkPath = path.resolve(benchmarkPath);
        const resolvedScriptPath = path.resolve(agentScriptPath);

        // Upfront checks for required dependencies
        yield* Effect.promise(() => checkDependenciesPresent());

        yield* Console.log(
          `Generating a program for the benchmark project with the supplied coding agent`,
        );
        yield* Console.log(`Benchmark: ${resolvedBenchmarkPath}`);
        yield* Console.log(`Agent script: ${resolvedScriptPath}`);

        // Create coding agent from shell script
        const codingAgent = createShellAgent(resolvedScriptPath);

        // Run benchmark
        yield* runBenchmarkWithNewCode(resolvedBenchmarkPath, codingAgent);
      }),
    ),
  );
}

/* Subcommand: cqb existing <benchmark-path> <existing-code-path> */
function makeRunWithExistingSubCommand() {
  const existingProgramPath = Args.text({
    name: "existing-program-path",
  }).pipe(
    Args.withDescription(
      "Path to the directory of the pre-existing program that satisfies the initial prompt for the benchmark project",
    ),
  );

  return Command.make("existing", {
    benchmarkPath,
    existingCodePath: existingProgramPath,
  }).pipe(
    Command.withDescription("Run benchmark with existing/refactored program"),
    Command.withHandler(({ benchmarkPath, existingCodePath }) =>
      Effect.gen(function* () {
        const resolvedBenchmarkPath = path.resolve(benchmarkPath);
        const resolvedProgramPath = path.resolve(existingCodePath);

        // Upfront checks for required dependencies
        yield* Effect.promise(() => checkDependenciesPresent());

        yield* Console.log(`Running benchmark with existing program`);
        yield* Console.log(`Benchmark: ${resolvedBenchmarkPath}`);
        yield* Console.log(`Existing code: ${resolvedProgramPath}`);

        // Run benchmark
        yield* runBenchmarkWithExistingCode(
          resolvedBenchmarkPath,
          resolvedProgramPath,
        );
      }),
    ),
  );
}

/* Subcommand: cqb debug:list-tests */
function makeListTestStrategiesSubCommand() {
  return Command.make("debug:list-tests").pipe(
    Command.withDescription(
      "For internal debugging: list discoverable functionality test strategies",
    ),
    Command.withHandler(() =>
      Effect.gen(function* () {
        const availableStrategies = discoverBenchmarksWithTests();

        if (availableStrategies.length === 0) {
          yield* Console.log("No functionality test strategies found.");
          return;
        }

        yield* Console.log(
          `Found ${availableStrategies.length} functionality test strategies:`,
        );
        for (const { benchmarkSet, project, testDir } of availableStrategies) {
          yield* Console.log(`  - ${benchmarkSet}/${project}/${testDir}`);
        }
      }),
    ),
  );
}

const command = Command.make("cqb").pipe(
  Command.withSubcommands([
    makeRunFromScratchSubCommand(),
    makeRunWithExistingSubCommand(),
    makeTestSubCommand(),
    makeListTestStrategiesSubCommand(),
  ]),
  Command.withDescription(
    HelpDoc.blocks([
      HelpDoc.p("Code Quality Benchmark CLI"),
      HelpDoc.h2("Examples"),
      HelpDoc.enumeration([
        HelpDoc.p(
          "Benchmark from scratch on the todolist-easy project: cqb run benchmarks/evolvability/todolist-easy ./my-agent.sh",
        ),
        HelpDoc.p(
          "Benchmark with existing code on the todolist-easy project: cqb existing benchmarks/evolvability/todolist-easy /tmp/benchmark-xxx/original-program",
        ),
        HelpDoc.p(
          "Run functionality tests on an attempt at the todolist-easy project: LOG_LEVEL=debug cqb test benchmarks/evolvability/todolist-easy /tmp/benchmark-xxx/attempt",
        ),
      ]),
    ]),
  ),
);

const cli = Command.run(command, {
  name: "Code Quality Benchmark",
  version: "0.1.1", // TODO: Find a way to get this automatedly or something from a more centralized location?
});

cli(process.argv).pipe(
  Effect.catchAllCause((cause) =>
    Effect.gen(function* () {
      yield* Console.error(Cause.pretty(cause));
      yield* Effect.sync(() => process.exit(1));
    }),
  ),
  Effect.provide(
    Layer.mergeAll(NodeContext.layer, CliConfig.layer({ showBuiltIns: false })),
  ),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
