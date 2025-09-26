import { z } from "zod";
import type { Logger } from "../utils/logger/logger.ts";
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

export interface TestSuiteResults extends Report {
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

export function allTestsPassed(result: TestSuiteResults): boolean {
  return result.summary.passed === result.summary.total;
}

/** Each test in the suite either passed or was skipped */
export function hasNoFailures(result: TestSuiteResults): boolean {
  return result.summary.failed === 0;
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
});

export type TestResult = z.infer<typeof TestResultSchema>;

// interface TestGroupResults {
//   name: string;
//   tests: TestResult[];
// }

export class Reporter {
  constructor(private logger: Logger) {}

  report(results: TestSuiteResults): void {
    this.logger.info(jsonStringify(results));

    // Summary logging
    if (results.summary.failed > 0) {
      this.logger.error(
        `✗ Suite "${results.name}" failed: ${results.summary.failed}/${results.summary.total} tests failed`,
      );

      const failedTests = results.results.filter(
        (r) => r.outcome.status === "failed",
      );
      failedTests.forEach((test) => {
        if (test.outcome.status === "failed") {
          this.logger.error(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else if (results.summary.skipped > 0) {
      this.logger.warn(`⊘ ${results.summary.skipped} test(s) were skipped`);
      const skippedTests = results.results.filter(
        (r) => r.outcome.status === "skipped",
      );
      skippedTests.forEach((test) => {
        if (test.outcome.status === "skipped") {
          this.logger.warn(`  • ${test.name}: ${test.outcome.reason}`);
        }
      });
    } else {
      this.logger.info(`✓ All tests in suite ${results.name} passed`);
    }
    this.logger.info(
      `Test execution for ${results.name} completed in ${(results.summary.duration / 1000).toFixed(1)}s`,
    );
  }
}
