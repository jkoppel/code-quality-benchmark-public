import { makeAttributeIsolationTest } from "./test-factory.js";

export const attributeIsolationPriority = makeAttributeIsolationTest(
  "Test that changing a task's priority doesn't affect other tasks",
  "priority",
  "Change task 1's priority to a different value from the available priorities",
);

export const attributeIsolationStatus = makeAttributeIsolationTest(
  "Test that changing a task's status doesn't affect other tasks",
  "status",
  "Change task 1's status to a different value from the available statuses",
);

export const attributeIsolationDueDate = makeAttributeIsolationTest(
  "Test that changing a task's due date doesn't affect other tasks",
  "dueDate",
  "Change task 1's due date to a different date",
);
