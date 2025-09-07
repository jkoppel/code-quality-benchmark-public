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

import type { Suite } from "./suite.js";

export async function loadTestSuite(benchmarkPath: string): Promise<Suite> {
  const { benchmarkSet, task } = parseBenchmarkPath(benchmarkPath);
  return await getTestSuite(benchmarkSet, task);
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
  const benchmarksIndex = parts.findIndex((part) => part === "benchmarks");

  if (benchmarksIndex === -1 || benchmarksIndex + 2 >= parts.length) {
    throw new Error(`Invalid benchmark path: ${benchmarkPath}. Expected: benchmarks/<benchmarkSet>/<task>`);
  }

  return {
    benchmarkSet: parts[benchmarksIndex + 1], // e.g., "evolvability"
    task: parts[benchmarksIndex + 2], // e.g., "todolist-easy"
  };
}

const TEST_PATH_REGISTRY = {
  "evolvability/todolist-easy": "../tests/evolvability/todolist-easy/functional-tests.js",
  // Add more entries like: 'evolvability/calculator': '../tests/evolvability/calculator/functional-tests.js',
} as const;

/** Dynamically import the functional test suite for the benchmark set */
export async function getTestSuite(benchmarkSet: string, task: string): Promise<Suite> {
  const key = `${benchmarkSet}/${task}`;

  if (!(key in TEST_PATH_REGISTRY)) {
    const availableKeys = Object.keys(TEST_PATH_REGISTRY).join(", ");
    throw new Error(`No test suite found for ${key}. Available: ${availableKeys}`);
  }

  const testPath = TEST_PATH_REGISTRY[key as keyof typeof TEST_PATH_REGISTRY];

  // Using dynamic import to avoid circular dependencies since test files import the Suite type from ./suite.js
  // TODO: add tests / checks of the registry, and perhaps run these checks on npm run check
  const testModule = (await import(testPath)) as { default: Suite };
  return testModule.default;
}
