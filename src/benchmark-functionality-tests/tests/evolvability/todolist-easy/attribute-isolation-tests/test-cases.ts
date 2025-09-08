import { makeAttributeIsolationTest } from "./test-factory.js";
import { PriorityTaskAttribute, DueDateTaskAttribute, StatusTaskAttribute } from "../shared/task-attribute.js";

export const attributeIsolationPriority =
  makeAttributeIsolationTest(new PriorityTaskAttribute());

export const attributeIsolationStatus = makeAttributeIsolationTest(new StatusTaskAttribute());

export const attributeIsolationDueDate = makeAttributeIsolationTest(new DueDateTaskAttribute());
