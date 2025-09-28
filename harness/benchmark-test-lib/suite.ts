import type { Effect } from "effect";
import type { DiscoveryAgent } from "./agents/discovery-agent.ts";
import type { DriverAgentError } from "./agents/driver-agent.ts";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "./agents/test-case-agent.ts";
import type { TestContext } from "./context.ts";
import type { TestResult } from "./report.ts";
import type { TestRunnerConfig } from "./runner.ts";

/********************************
    Suite Generation Strategy
*********************************/

export interface SuiteGenerationStrategy {
  /** Gather info on the app */
  discover(
    config: TestRunnerConfig,
    discoveryAgent: DiscoveryAgent,
  ): Effect.Effect<TestContext, DriverAgentError, never>;

  /** Generate the Suite using the gathered info. */
  generateSuite(
    config: TestRunnerConfig,
    context: TestContext,
  ): Effect.Effect<Suite, never, never>;
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
  ): Effect.Effect<TestResult, DriverAgentError, never>;
}
