import type { TestContext } from "./context.js";
import type { DiscoveryAgent } from "./discovery-agent.js";
import type { TestResult } from "./report.js";
import type { TestRunnerConfig } from "./runner.js";
import type { TestCaseAgent, TestCaseAgentOptions } from "./test-case-agent.js";

/********************************
    Suite Generation Strategy
*********************************/

export interface SuiteGenerationStrategy {
  /** Gather info on the app */
  discover(
    config: TestRunnerConfig,
    discoveryAgent: DiscoveryAgent,
  ): Promise<TestContext>;

  /** Generate the Suite using the gathered info. */
  generateSuite(config: TestRunnerConfig, context: TestContext): Promise<Suite>;
}

/**************************
        Suite
***************************/

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
  descriptiveName: string;
  run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult>;
}
