import type { TestResult } from "./report";
import type { NonVisionTestCaseAgent, VisionTestCaseAgent } from "./test-case-agent";

export type TestCase = VisionTestCase | NonVisionTestCase;

export interface VisionTestCase {
  description: string;
  run(agent: VisionTestCaseAgent): Promise<TestResult>;
}

export interface NonVisionTestCase {
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
