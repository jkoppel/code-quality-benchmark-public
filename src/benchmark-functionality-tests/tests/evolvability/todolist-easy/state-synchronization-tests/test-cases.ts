import { makeStateSynchTest } from "./test-factory.js";
import dedent from "dedent";

/**********************************************************
    'I'm feeling lucky' state synchronization test cases
***********************************************************/

export const quickStateSynchStatus = makeStateSynchTest(
  "Test state synchronization of task status state (if applicable)",
  "status of a task",
  (appInfo) => dedent`
  ${JSON.stringify(appInfo.taskInfo.views.status)}
  ${JSON.stringify(appInfo.todoListInfo)}`,
);

export const quickStateSynchPriority = makeStateSynchTest(
  "Test state synchronization of task priority state (if applicable)",
  "priority of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.views.priority),
);

export const quickStateSynchDueDate = makeStateSynchTest(
  "Test state synchronization of task due date state (if applicable)",
  "due date of a task",
  (appInfo) => JSON.stringify(appInfo.taskInfo.views["due date"]),
);
