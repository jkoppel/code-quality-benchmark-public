import * as z from "zod";
import type { FixturesEnv } from "../../../test-lib/fixture.js";
import type { TestResult } from "../../../test-lib/report.js";
import { type NonVisionTestCase, Suite } from "../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../test-lib/test-case-agent.js";
import type { TestRunnerConfig } from "../../../test-lib/runner.js";
import { TodoListAppInfo } from "./schemas/app-info-schema.js";
import { makeBackgroundPrompt } from "./test-helpers/common-prompts.js";
import {
  appInfoReconFixtureMaker,
  appInfoFixtureId,
} from "./fixtures/scout-fixture.js";
import {
  makeStateSynchTest,
  makeAttributeIsolationTest,
} from "./test-helpers/test-factories.js";
import dedent from "dedent";

/*************************************
    Basic Tests
***************************************/

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

      Check if this todo app supports more statuses than just done/not-done.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
};

/*************************************
    State Synchronization Tests
***************************************/

const quickStateSynchStatus = makeStateSynchTest(
  "Test state synchronization of task status state (if applicable)",
  "status of a task",
  (appInfo) => dedent`
  ${JSON.stringify(appInfo.taskInfo.viewsForStatus)}
  ${JSON.stringify(appInfo.todoListInfo)}`,
);

const quickStateSynchPriority = makeStateSynchTest(
  "Test state synchronization of task priority state (if applicable)",
  "priority of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.viewsForPriority),
);

const quickStateSynchDueDate = makeStateSynchTest(
  "Test state synchronization of task due date state (if applicable)",
  "due date of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.viewsForDueDate),
);

/*************************************
    Attribute Isolation Tests
***************************************/

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
  // 'I'm feeling lucky' State synchronization tests
  quickStateSynchStatus,
  quickStateSynchPriority,
  quickStateSynchDueDate,
  // Attribute isolation tests
  attributeIsolationPriority,
  attributeIsolationStatus,
  attributeIsolationDueDate,
]).withFixtures([appInfoReconFixtureMaker]);
