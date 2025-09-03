import type { TestResult } from "./report";
import type { TestCaseAgent } from "./test-case-agent";

export interface VisionTestCase {
  description: string;
  run(agent: TestCaseAgent): Promise<TestResult>;
}

export interface NonVisionTestCase {
  description: string;
  run(agent: TestCaseAgent): Promise<TestResult>;
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
