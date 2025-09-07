import * as z from "zod";
import type {
  FixtureAgent,
  FixtureMaker,
  FixturesEnv,
} from "../../../test-lib/fixture.js";
import type { TestResult } from "../../../test-lib/report.js";
import { type NonVisionTestCase, Suite } from "../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../test-lib/test-case-agent.js";
import { TodoListAppInfo } from "./app-info-schema.js";
import dedent from "dedent";
import type { TestRunnerConfig, SutConfig } from "../../../test-lib/runner.js";

/*************************************
    Fixture
***************************************/

const appInfoFixtureId = "todoListAppInfo";

const todoAppFixtureMaker: FixtureMaker = {
  id: appInfoFixtureId,
  async initialize(agent: FixtureAgent, config: SutConfig) {
    return await agent.query(
      dedent`
        You are a senior developer trying to get a preliminary understanding of this app.
        You have access to the code of the app in this directory; you can also use Playwright MCP.
        The dev server has been started at port ${config.port}.
        Your task:
        1. Skim the code and make a rough plan for what UI interactions you *minimally* need to do to get the info requested in the following schema.
        2. Collect and return that information.
        If there's stuff you can't figure out, try to at least offer suggestions for what paths through the UI to investigate or look at.
        Your goal is *not* to actually test the app -- it's merely to enumerate all the UI / views for the various pieces of state and flag potential issues for other testers to investigate in more depth.
        That said, although you aren't testing the app, you still need to thoroughly explore and record how the key pieces of state are exposed to users.`,
      TodoListAppInfo,
    );
  },
};

/*************************************
    Test Cases
***************************************/

const toyTest: NonVisionTestCase = {
  type: "non-vision" as const,
  description: "Toy test that always passes",
  // eslint-disable-next-line @typescript-eslint/require-await
  async run(): Promise<TestResult> {
    return {
      name: "Toy test that always passes",
      outcome: {
        status: "passed",
        howTested:
          "This is a constant test that always returns passed for e2e testing",
      },
    };
  },
};

// // Simple test case to check if can call CC
// const agentAlwaysPassesTest: NonVisionTestCase = {
//   type: "non-vision" as const,
//   description: "Simple agent response test",
//   async run(agent: NonVisionTestCaseAgent): Promise<TestResult> {
//     return await agent.check("Respond with a test result indicating this test passed");
//   },
// };

const canUseFixturesTest: NonVisionTestCase = {
  type: "non-vision" as const,
  description: "Test that can use fixtures",
  async run(
    agent: NonVisionTestCaseAgent,
    fixtures: FixturesEnv,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const fixture = fixtures.get(appInfoFixtureId) as z.infer<
      typeof TodoListAppInfo
    >;
    config.logger.info("Using fixture", fixture);
    return {
      name: "Toy const pass 2",
      outcome: {
        status: "passed",
        howTested:
          "This is a constant test that always returns passed for e2e testing",
      },
    };
  },
};

export default new Suite("Todolist Easy Toy Tests", [
  toyTest,
  canUseFixturesTest,
]).withFixtures([todoAppFixtureMaker]);
