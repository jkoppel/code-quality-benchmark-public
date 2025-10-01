import { Effect } from "effect";
import { z } from "zod";
import { LoggerConfig } from "../utils/logger/logger.ts";
import { jsonStringify } from "../utils/logger/pretty.ts";

/*********************************
    For report
************************************/

/* TODO For the future:
metadata like CC session id
*/

export interface Report {
  sutFolderPath: string;
  timestamp: string;
}

export interface TestSuiteResult extends Report {
  name: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
}

export function allTestsPassed(result: TestSuiteResult): boolean {
  return result.summary.passed === result.summary.total;
}

/** Each test in the suite either passed or was skipped */
export function hasNoFailures(result: TestSuiteResult): boolean {
  return result.summary.failed === 0;
}

export interface TestResult {
  name: string;
  outcome:
    | {
        status: "passed";
        howTested: string;
      }
    | {
        status: "failed";
        reason: string;
        howTested: string;
      }
    | {
        status: "skipped";
        reason: string;
      };
}

export const TestResultSchema = z.object({
  name: z.string(),
  outcome: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("passed"),
      howTested: z
        .string()
        .describe("Description of what was done to test this, if not obvious"),
    }),
    z.object({
      status: z.literal("failed"),
      reason: z.string(),
      howTested: z
        .string()
        .describe("Description of what was done to test this, if not obvious"),
    }),
    z.object({
      status: z.literal("skipped"),
      reason: z.string(),
    }),
  ]),
}) satisfies z.ZodType<TestResult>;

// interface TestGroupResults {
//   name: string;
//   tests: TestResult[];
// }

export class Reporter {
  report(results: TestSuiteResult): Effect.Effect<void, never, LoggerConfig> {
    return Effect.gen(function* () {
      const { logger } = yield* LoggerConfig;

      yield* logger.info(jsonStringify(results));

      // Summary logging
      if (results.summary.failed > 0) {
        yield* logger.error(
          `✗ Suite "${results.name}" failed: ${results.summary.failed}/${results.summary.total} tests failed`,
        );

        const failedTests = results.results.filter(
          (r) => r.outcome.status === "failed",
        );
        for (const test of failedTests) {
          if (test.outcome.status === "failed") {
            yield* logger.error(`  • ${test.name}: ${test.outcome.reason}`);
          }
        }
      } else if (results.summary.skipped > 0) {
        yield* logger.warn(`⊘ ${results.summary.skipped} test(s) were skipped`);
        const skippedTests = results.results.filter(
          (r) => r.outcome.status === "skipped",
        );
        for (const test of skippedTests) {
          if (test.outcome.status === "skipped") {
            yield* logger.warn(`  • ${test.name}: ${test.outcome.reason}`);
          }
        }
      } else {
        yield* logger.info(`✓ All tests in suite ${results.name} passed`);
      }
      yield* logger.info(
        `Test execution for ${results.name} completed in ${(results.summary.duration / 1000).toFixed(1)}s`,
      );
    });
  }
}
