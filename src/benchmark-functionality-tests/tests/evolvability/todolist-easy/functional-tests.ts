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

const makeToolsInfoPrompt = (config: SutConfig) => dedent`
  You have access to the app's code in this directory; you can also use Playwright MCP.
  The dev server has been started at port ${config.port}.`;

/*************************************
    Fixture
***************************************/

const appInfoFixtureId = "todoListAppInfo";

const appInfoReconFixtureMaker: FixtureMaker = {
  id: appInfoFixtureId,
  async initialize(agent: FixtureAgent, config: SutConfig) {
    return await agent.query(
      dedent`
        You are a senior developer trying to piece together a preliminary understanding of this program,
        to help downstream testers test its functionality.

        <spec-of-system-under-test>
        This is a React todo list app where you can add, remove, and edit tasks.
        A user should be able to create and delete todo items, view the TodoList, and mark items as done.
        The app has also been extended to support the following features:
          * Assigning more statuses to todo items, in addition to the existing done/not-done (e.g.: in-progress, under review, blocked)
          * Assign priorities to todo items
          * Adding due dates to todo items
        </spec-of-system-under-test>
        This specification deliberately leaves a lot open. For instance,
        some apps might expose a task’s status via both a checkbox and a dropdown menu;
        others might only have one way to observe and change it.
        That's where you come in. Part of your job is to investigate and explain the design decisions that
        the system under test has made, especially with regards to state and how it is exposed to users
        (see the following schema for exactly what info to collect).

        More concretely, here's what you should do.
        ${makeToolsInfoPrompt(config)}
        0. Read the schema to understand exactly what information you need to collect.
        1. Skim the code and make a rough plan for what UI interactions you *minimally* need to do to collect the requested information; in particular, what you need to do to uncover key decision decisions regarding state, how it's exposed, and potential functional bugs.
        2. Collect and return that information.
        If there's stuff you can't figure out, try to at least offer suggestions for what paths through the UI to investigate or look at.
        Your goal is *not* to actually test the app -- it's merely to investigate the decision decisions, enumerate all the UI / views for the various pieces of state, and flag potential issues for other testers to investigate in more depth.
        That said, although you aren't testing the app, you still need to investigate it thoroughly enough that downstream testers can figure out what they should be testing.`,
      TodoListAppInfo,
    );
  },
};

/*************************************
    Test Case Factory
***************************************/

const makeBackgroundPrompt = (config: SutConfig) => dedent`
      You're testing a Todolist app.
      ${makeToolsInfoPrompt(config)}`;

function makeStateSynchTest(
  testName: string,
  stateName: string,
  viewsExtractor: (appInfo: z.infer<typeof TodoListAppInfo>) => string,
  overallGoal: string = `Your overall goal is to test synchronization of ${stateName.toLowerCase()}, broadly construed, as well as any synchronizations of this state with other key pieces of state`,
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
        ${makeBackgroundPrompt(config)}
        Here is some information that someone else gathered about the views of or UI elements for the ${stateName} (and related things):
        ${views}

        ${overallGoal}
        In particular:
        1. Skim the relevant code for more context -- it'll help with knowing what to focus on testing.
        2. Think about the specification and what UI paths you have to explore to *thoroughly* test such synchronization before doing it.
        E.g., if the ${stateName} is exposed in two ways, check if (i) changing it via one way also updates the other view and (ii) changing it via the other view also updates the first view.

        Then evaluate as follows:
        * If the ${stateName} is only exposed in one way and there are no interactions with other pieces of state, mark the test as passing.
        * If the ${stateName} is exposed in more than one way in the UI, check if this state has been synchronized correctly across the different views.

        Examples of synchronization failures:
        - For an app with both an icon/badge and a text label for the status: Status icon updates but text label doesn't change
        - For an app with both a detailed view and a summary view: Status changes in the detailed view but not in the summary view
        `);
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
      const availableStatuses = appInfo.taskInfo.statuses;
      const availablePriorities = appInfo.taskInfo.priorityLevels;
      const taskConfigs = generateDiverseTaskConfigs(
        availableStatuses,
        availablePriorities,
      );

      const prompt = dedent`
        ${makeBackgroundPrompt(config)}
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

// State Synch tests

const stateSynchStatus = makeStateSynchTest(
  "Test state synchronization of task status state (if applicable)",
  "status of a task",
  (appInfo) => dedent`
  ${JSON.stringify(appInfo.taskInfo.viewsForStatus)}
  ${JSON.stringify(appInfo.todoListInfo)}`,
);

const stateSynchPriority = makeStateSynchTest(
  "Test state synchronization of task priority state (if applicable)",
  "priority of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.viewsForPriority),
);

const stateSynchDueDate = makeStateSynchTest(
  "Test state synchronization of task due date state (if applicable)",
  "due date of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.viewsForDueDate),
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
      ${makeBackgroundPrompt(config)}
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
