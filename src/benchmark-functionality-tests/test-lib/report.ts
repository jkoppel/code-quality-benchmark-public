import { z } from "zod";

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
