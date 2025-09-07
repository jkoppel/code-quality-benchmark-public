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

const appInfoReconFixtureMaker: FixtureMaker = {
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
    Test Case Factory
***************************************/

function makeStateSynchTest(
  testName: string,
  stateName: string,
  viewsExtractor: (
    appInfo: z.infer<typeof TodoListAppInfo>,
  ) => z.infer<typeof TodoListAppInfo>["taskInfo"]["viewsForStatus"],
): NonVisionTestCase {
  return {
    type: "non-vision" as const,
    description: testName,
    async run(
      agent: NonVisionTestCaseAgent,
      fixtures: FixturesEnv,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
        typeof TodoListAppInfo
      >;
      config.logger.debug("AppInfo fixture", appInfo);

      const views = viewsExtractor(appInfo);

      return agent.check(dedent`
        ${makeBackground(config)}
        Here is some information that someone else gathered about the views of or UI elements for the ${stateName}: ${JSON.stringify(views)}
        If the ${stateName} is only exposed in one way, mark the test as passing.
        If the ${stateName} is exposed in more than one way in the UI, check if this state has been synchronized correctly across the different views. E.g., see if after changing the state via one view, the updated state is also reflected in the other view.`);
    },
  };
}

function makeAttributeIsolationTest(
  testName: string,
  attributeName: "priority" | "dueDate" | "status",
  changeDescription: string,
): NonVisionTestCase {
  return {
    type: "non-vision" as const,
    description: testName,
    async run(
      agent: NonVisionTestCaseAgent,
      fixtures: FixturesEnv,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
        typeof TodoListAppInfo
      >;
      config.logger.debug("AppInfo fixture", appInfo);

      const availableStatuses = appInfo.taskInfo.statuses;
      const availablePriorities = appInfo.taskInfo.priorityLevels;
      const taskConfigs = generateDiverseTaskConfigs(
        availableStatuses,
        availablePriorities,
      );

      const prompt = dedent`
        ${makeBackground(config)}
        Test attribute isolation for ${attributeName}.

        Available statuses in this app: ${JSON.stringify(availableStatuses)}
        Available priority levels in this app: ${JSON.stringify(availablePriorities)}

        Your task:
        1. Create 3 tasks with diverse attribute values to exercise different states:
           - Task 1: ${taskConfigs[0]}
           - Task 2: ${taskConfigs[1]}
           - Task 3: ${taskConfigs[2]}
        2. Record the initial state of all 3 tasks
        3. ${changeDescription}
        4. Verify that tasks 2 and 3 retain ALL their original attributes (priority, due date, status)

        Mark the test as passing if changing task 1's ${attributeName} doesn't affect any attributes of the other tasks.
        Mark as failing if any other task's attributes changed.`;

      config.logger.debug("Attribute isolation test prompt", { prompt });
      return agent.check(prompt);
    },
  };
}

/*************************************
    Test Cases
***************************************/

const makeBackground = (config: SutConfig) => dedent`
      You're testing a Todolist app.
      You have access to the code of the app in this directory; you can also use Playwright MCP.
      The dev server has been started at port ${config.port}`;

// const toyTest: NonVisionTestCase = {
//   type: "non-vision" as const,
//   description: "Toy test that always passes",
//   // eslint-disable-next-line @typescript-eslint/require-await
//   async run(): Promise<TestResult> {
//     return {
//       name: "Toy test that always passes",
//       outcome: {
//         status: "passed",
//         howTested:
//           "This is a constant test that always returns passed for e2e testing",
//       },
//     };
//   },
// };

// // Simple test case to check if can call CC
// const agentAlwaysPassesTest: NonVisionTestCase = {
//   type: "non-vision" as const,
//   description: "Simple agent response test",
//   async run(agent: NonVisionTestCaseAgent): Promise<TestResult> {
//     return await agent.check("Respond with a test result indicating this test passed");
//   },
// };

// State Synch tests

const stateSynchStatus = makeStateSynchTest(
  "Test state synchronization of task status state (if applicable)",
  "status of a task",
  (appInfo) => appInfo.taskInfo.viewsForStatus,
);

const stateSynchPriority = makeStateSynchTest(
  "Test state synchronization of task priority state (if applicable)",
  "priority of a task",
  (appInfo) => appInfo.taskInfo.viewsForPriority,
);

const stateSynchDueDate = makeStateSynchTest(
  "Test state synchronization of task due date state (if applicable)",
  "due date of a task",
  (appInfo) => appInfo.taskInfo.viewsForDueDate,
);

// Status variety test

const checkMoreThanDoneNotDoneStatuses: NonVisionTestCase = {
  type: "non-vision" as const,
  description: "Test that the app has more than done/not-done statuses",
  async run(
    agent: NonVisionTestCaseAgent,
    fixtures: FixturesEnv,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
      typeof TodoListAppInfo
    >;
    const availableStatuses = appInfo.taskInfo.statuses;

    return agent.check(dedent`
      ${makeBackground(config)}
      The app has these available statuses: ${JSON.stringify(availableStatuses)}

      Check if this todo app supports more sophisticated status tracking than just basic done/not-done functionality.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
};

// Attribute isolation tests

const attributeIsolationPriority = makeAttributeIsolationTest(
  "Test that changing a task's priority doesn't affect other tasks",
  "priority",
  "Change task 1's priority to a different value from the available priorities",
);

const attributeIsolationStatus = makeAttributeIsolationTest(
  "Test that changing a task's status doesn't affect other tasks",
  "status",
  "Change task 1's status to a different value from the available statuses",
);

const attributeIsolationDueDate = makeAttributeIsolationTest(
  "Test that changing a task's due date doesn't affect other tasks",
  "dueDate",
  "Change task 1's due date to a different date",
);

export default new Suite("Todolist Functionality Tests", [
  // Basic
  checkMoreThanDoneNotDoneStatuses,
  // State synch
  stateSynchStatus,
  stateSynchPriority,
  stateSynchDueDate,
  // Changing one attribute of a task doesn't affect attributes of other tasks
  attributeIsolationPriority,
  attributeIsolationStatus,
  attributeIsolationDueDate,
]).withFixtures([appInfoReconFixtureMaker]);

/*************************************
    Helper Functions
***************************************/

function generateDiverseTaskConfigs(
  availableStatuses: string[],
  availablePriorities: string[],
): string[] {
  const pickDiverse = (options: string[], taskIndex: number): string => {
    if (options.length === 0) return "default";
    if (options.length === 1) return options[0];
    if (options.length === 2) {
      return options[taskIndex % 2];
    }
    const indices = [0, Math.floor(options.length / 2), options.length - 1];
    return options[indices[taskIndex]];
  };

  const dueDates = ["tomorrow", "next week", "yesterday (or past date)"];

  return [0, 1, 2].map((i) => {
    const status = pickDiverse(availableStatuses, i);
    const priorityIndex = 2 - i;
    const priority = pickDiverse(availablePriorities, priorityIndex);

    return `priority: "${priority}", status: "${status}", due: ${dueDates[i]}`;
  });
}
