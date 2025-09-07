import type { TestResult } from "./report.js";
import type {
  NonVisionTestCaseAgent,
  VisionTestCaseAgent,
} from "./test-case-agent.js";

export type TestCase = VisionTestCase | NonVisionTestCase;

export interface VisionTestCase {
  type: "vision";
  description: string;
  run(agent: VisionTestCaseAgent): Promise<TestResult>;
}

export interface NonVisionTestCase {
  type: "non-vision";
  description: string;
  run(agent: NonVisionTestCaseAgent): Promise<TestResult>;
}

export class Suite {
  constructor(
    /** Descriptive name */
    private name: string,
    private tests: TestCase[],
  ) {}

  getName() {
    return this.name;
  }

  getTests() {
    return this.tests;
  }
}

export async function loadTestSuite(benchmarkPath: string): Promise<Suite> {
  const { benchmarkSet, task } = parseBenchmarkPath(benchmarkPath);
  return await getTestSuite(benchmarkSet, task);
}
