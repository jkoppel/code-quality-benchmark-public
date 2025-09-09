import { makeAttributeIsolationTest } from "./test-factory.js";
import {
  PriorityTaskAttribute,
  DueDateTaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.js";

export const attributeIsolationPriority = makeAttributeIsolationTest(
  PriorityTaskAttribute,
);

export const attributeIsolationStatus =
  makeAttributeIsolationTest(StatusTaskAttribute);

export const attributeIsolationDueDate =
  makeAttributeIsolationTest(DueDateTaskAttribute);
