import type { FixtureMaker, FixturesEnv } from "./fixture.js";
import type { TestResult } from "./report.js";
import type {
  NonVisionTestCaseAgent,
  VisionTestCaseAgent,
} from "./test-case-agent.js";
import type { TestRunnerConfig } from "./runner.js";

/**************************
      Test Case
***************************/

export type TestCase = VisionTestCase | NonVisionTestCase;

export interface VisionTestCase {
  type: "vision";
  description: string;
  run(
    agent: VisionTestCaseAgent,
    fixtures: FixturesEnv,
    config: TestRunnerConfig,
  ): Promise<TestResult>;
}

export interface NonVisionTestCase {
  type: "non-vision";
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
    private fixtureInfos: FixtureMaker[] = [],
  ) {}

  getName() {
    return this.name;
  }

  getTests() {
    return this.tests;
  }

  withFixtures(infos: FixtureMaker[]) {
    this.fixtureInfos = infos;
  }

  getFixtureInfos() {
    return this.fixtureInfos;
  }
}
