import {
  DueDateTaskAttribute,
  PriorityTaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.js";
import { makeAttributeIsolationTest } from "./test-factory.js";

export const attributeIsolationPriority = makeAttributeIsolationTest(
  PriorityTaskAttribute,
);

export const attributeIsolationStatus =
  makeAttributeIsolationTest(StatusTaskAttribute);

export const attributeIsolationDueDate =
  makeAttributeIsolationTest(DueDateTaskAttribute);
