import type { FixtureMaker, FixturesEnv } from "./fixture.js";
import type { TestResult } from "./report.js";
import type { NonVisionTestCaseAgent } from "./test-case-agent.js";
import type { TestRunnerConfig } from "./runner.js";

/**************************
      Test Case
***************************/

// TODO: May not want to distinguish at type level between tests tt require vision caps and those that don't

// export type TestCase = VisionTestCase | NonVisionTestCase;

// export interface VisionTestCase {
//   type: "vision";
//   description: string;
//   run(
//     agent: VisionTestCaseAgent,
//     fixtures: FixturesEnv,
//     config: TestRunnerConfig,
//   ): Promise<TestResult>;
// }

export interface TestCase {
  description: string;
  run(
    agent: NonVisionTestCaseAgent,
    fixtures: FixturesEnv,
    config: TestRunnerConfig,
  ): Promise<TestResult>;
}

/**************************
        Suite
***************************/

export class Suite {
  constructor(
    /** Descriptive name */
    private name: string,
    private tests: TestCase[],
    private fixtureMakers: FixtureMaker[] = [],
  ) {}

  getName() {
    return this.name;
  }

  getTests() {
    return this.tests;
  }

  withFixtures(makers: FixtureMaker[]) {
    this.fixtureMakers = makers;
    return this;
  }

  getFixtureMakers() {
    return this.fixtureMakers;
  }
}
