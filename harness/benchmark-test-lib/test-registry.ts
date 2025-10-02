/**
 * This module discovers functionality test strategies from the filesystem
 * following the conventions outlined below.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { Effect } from "effect";
import {
  InvalidBenchmarkPathError,
  type TestLoadError,
  TestSuiteImportError,
} from "./errors.ts";
import type { SuiteGenerationStrategy } from "./suite.ts";

//------------------------------------------------------
//  Path Structure / Conventions
//------------------------------------------------------

/** Path structure / conventions for test strategies */
const TESTS_PATHS_CONVENTION = {
  /** Root directory name for all benchmarks
   * IMPT ASSUMPTION: $BENCHMARKS_ROOT is a sibling of the harness folder
   */
  BENCHMARKS_ROOT: "benchmarks" as const,
  /** Directory name for functionality tests within each benchmark */
  TEST_DIR: "functionality-tests" as const,
  /** Filename for test strategy modules (without extension) */
  BASE_FILENAME: "test-strategy" as const,
  /** Expected benchmark path pattern */
  BENCHMARK_PATTERN: "benchmarks/<benchmarkSet>/<project>" as const,
  /** Computed: Number of path segments after the benchmarks root */
  get DEPTH_AFTER_ROOT() {
    return this.BENCHMARK_PATTERN.split("/").length - 1;
  },
} as const;

/** Derive glob pattern for build tools from the convention */
export function getTestStrategyGlobPattern(): string {
  const { BENCHMARKS_ROOT, TEST_DIR, BASE_FILENAME } = TESTS_PATHS_CONVENTION;
  return `${BENCHMARKS_ROOT}/**/${TEST_DIR}/${BASE_FILENAME}.ts`;
}

//------------------------------------------------------
//  Test Strategy Discovery
//------------------------------------------------------

/**
 * Discover benchmarks with functionality tests by scanning the filesystem.
 * Depends on the TESTS_PATHS_CONVENTION.
 */
export function discoverBenchmarksWithTests(): Array<{
  benchmarkSet: string;
  project: string;
  testDir: string;
}> {
  const { BENCHMARKS_ROOT, TEST_DIR, BASE_FILENAME } = TESTS_PATHS_CONVENTION;

  return fs
    .readdirSync(BENCHMARKS_ROOT)
    .filter((name) =>
      fs.statSync(path.join(BENCHMARKS_ROOT, name)).isDirectory(),
    )
    .flatMap((benchmarkSet) =>
      fs
        .readdirSync(path.join(BENCHMARKS_ROOT, benchmarkSet))
        .filter((name) =>
          fs
            .statSync(path.join(BENCHMARKS_ROOT, benchmarkSet, name))
            .isDirectory(),
        )
        .map((project) => ({ benchmarkSet, project, testDir: TEST_DIR })),
    )
    .filter(({ benchmarkSet, project }) =>
      fs.existsSync(
        path.join(
          BENCHMARKS_ROOT,
          benchmarkSet,
          project,
          TEST_DIR,
          `${BASE_FILENAME}.ts`,
        ),
      ),
    );
}

//------------------------------------------------------
//  Load test suite generation strategy
//------------------------------------------------------

/**
 * Load a test suite generation strategy for a specific benchmark set.
 * Main entry point for strategy loading.
 */
export function loadSuiteGenerationStrategy(
  benchmarkPath: string,
): Effect.Effect<SuiteGenerationStrategy, TestLoadError> {
  return parseBenchmarkPath(benchmarkPath).pipe(
    Effect.flatMap(({ benchmarkSet, project }) =>
      getSuiteGenerationStrategy(benchmarkSet, project),
    ),
  );
}

/** Dynamically import the test suite generation strategy using convention-based path */
function getSuiteGenerationStrategy(
  /** e.g., "evolvability" */
  benchmarkSet: string,
  project: string,
): Effect.Effect<SuiteGenerationStrategy, TestSuiteImportError> {
  const { BENCHMARKS_ROOT, TEST_DIR, BASE_FILENAME } = TESTS_PATHS_CONVENTION;

  const strategyPath =
    "./" +
    path
      .join(
        // Import path is relative to dist/ where both the harness bundle and compiled benchmarks live
        BENCHMARKS_ROOT,
        benchmarkSet,
        project,
        TEST_DIR,
        BASE_FILENAME,
      )
      .concat(".js");
  /*
    Dynamic imports use the compiled js
    Using dynamic import to avoid circular dependencies since test files import stuff from the test-lib

    TODO: I'm not sure, but I'm tempted to think I prefer static imports
    (since that way we will statically know if there's some issue with importing the functionality tests).
    Haven't looked too much into the circular dependencies issue I ran into at the start --- there may be an easy workaround
    */

  return Effect.tryPromise({
    try: async () => (await import(strategyPath)).default,
    catch: (error) => {
      const available = discoverBenchmarksWithTests()
        .map(
          ({ benchmarkSet, project, testDir }) =>
            `${benchmarkSet}/${project}/${testDir}`,
        )
        .join(", ");

      return new TestSuiteImportError({
        testSuiteStrategyPath: strategyPath,
        availableStrategies: available,
        underlyingError: error,
      });
    },
  });
}

//------------------------------------------------------
//  Helper: Parse Benchmark Path
//------------------------------------------------------

/**
 * Parses a benchmark path following the convention: benchmarks/<benchmarkSet>/<project>
 *
 * Examples:
 *   "benchmarks/evolvability/todolist-easy" → { benchmarkSet: "evolvability", project: "todolist-easy" }
 *   "/path/to/benchmarks/evolvability/todolist-easy" → { benchmarkSet: "evolvability", project: "todolist-easy" }
 *
 * @param benchmarkPath - Path following the TESTS_PATHS_CONVENTION
 */
export function parseBenchmarkPath(
  benchmarkPath: string,
): Effect.Effect<
  { benchmarkSet: string; project: string },
  InvalidBenchmarkPathError
> {
  const parts = benchmarkPath.split("/");
  const { BENCHMARKS_ROOT, BENCHMARK_PATTERN, DEPTH_AFTER_ROOT } =
    TESTS_PATHS_CONVENTION;
  const benchmarksIndex = parts.indexOf(BENCHMARKS_ROOT);

  if (
    benchmarksIndex === -1 ||
    benchmarksIndex + DEPTH_AFTER_ROOT >= parts.length
  ) {
    return Effect.fail(
      new InvalidBenchmarkPathError({
        benchmarkPath,
        expectedFormat: BENCHMARK_PATTERN,
      }),
    );
  }

  return Effect.succeed({
    benchmarkSet: parts[benchmarksIndex + 1],
    project: parts[benchmarksIndex + 2],
  });
}
