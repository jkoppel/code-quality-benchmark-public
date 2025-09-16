/**
 * Registry of test suite paths.
 *
 * Key format: "<benchmarkSet>/<task>" (matches benchmark path structure)
 * Values are import paths relative to this file.
 * Test files must be named "functional-tests.ts" and export a Suite as default.
 *
 * IMPORTANT: This relies on the path convention benchmarks/<benchmarkSet>/<task>
 * where `benchmarkSet` is the name of the benchmark set, e.g. 'evolvability',
 * and `task` is the specific challenge within that set, e.g. 'todolist-easy'.
 */

import type { SuiteGenerationStrategy } from "./suite.ts";

export async function loadSuiteGenerationStrategy(
  benchmarkPath: string,
): Promise<SuiteGenerationStrategy> {
  const { benchmarkSet, task } = parseBenchmarkPath(benchmarkPath);
  return await getSuiteGenerationStrategy(benchmarkSet, task);
}

/**
 * Parses a benchmark path following the convention: benchmarks/<benchmarkSet>/<task>
 *
 * Examples:
 *   "benchmarks/evolvability/todolist-easy" → { benchmarkSet: "evolvability", task: "todolist-easy" }
 *   "/path/to/benchmarks/evolvability/todolist-easy" → { benchmarkSet: "evolvability", task: "todolist-easy" }
 *
 * @param benchmarkPath - Path following benchmarks/<benchmarkSet>/<task> convention
 */
export function parseBenchmarkPath(benchmarkPath: string): {
  benchmarkSet: string;
  task: string;
} {
  const parts = benchmarkPath.split("/");

  // Find the "benchmarks" segment
  const benchmarksIndex = parts.indexOf("benchmarks");

  if (benchmarksIndex === -1 || benchmarksIndex + 2 >= parts.length) {
    throw new Error(
      `Invalid benchmark path: ${benchmarkPath}. Expected: benchmarks/<benchmarkSet>/<task>`,
    );
  }

  return {
    benchmarkSet: parts[benchmarksIndex + 1], // e.g., "evolvability"
    task: parts[benchmarksIndex + 2], // e.g., "todolist-easy"
  };
}

// Module paths without extensions --- '.js' is appended during dynamic import (dynamic imports use the compiled js)
export const TEST_STRATEGY_REGISTRY = {
  "evolvability/todolist-easy":
    "./benchmark-functionality-tests/tests/evolvability/todolist-easy/test-strategy",
  "evolvability/pixel-art":
    "./benchmark-functionality-tests/tests/evolvability/pixel-art/test-strategy",
  // Add more entries like: 'evolvability/calculator': '../tests/evolvability/calculator/test-strategy',
} as const;

/** Dynamically import the test suite generation strategy for the benchmark set */
export async function getSuiteGenerationStrategy(
  benchmarkSet: string,
  task: string,
): Promise<SuiteGenerationStrategy> {
  const key = `${benchmarkSet}/${task}`;

  if (!(key in TEST_STRATEGY_REGISTRY)) {
    throw new Error(
      `No test suite generation strategy found for ${key}. Available: ${Object.keys(TEST_STRATEGY_REGISTRY).join(", ")}`,
    );
  }

  const strategyPath =
    TEST_STRATEGY_REGISTRY[key as keyof typeof TEST_STRATEGY_REGISTRY];

  // Using dynamic import to avoid circular dependencies since test files import the Suite type from ./suite.ts
  // TODO: add tests / checks of the registry, and perhaps run these checks on npm run check
  return (
    // Dynamic imports use the compiled js
    (
      (await import(`${strategyPath}.js`)) as {
        default: SuiteGenerationStrategy;
      }
    ).default
  );
}
