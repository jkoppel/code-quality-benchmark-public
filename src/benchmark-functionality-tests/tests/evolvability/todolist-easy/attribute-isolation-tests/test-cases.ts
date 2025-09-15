import {
  DueDateTaskAttribute,
  PriorityTaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.ts";
import { makeAttributeIsolationTest } from "./test-factory.ts";

export const attributeIsolationPriority = makeAttributeIsolationTest(
  PriorityTaskAttribute,
);

export const attributeIsolationStatus =
  makeAttributeIsolationTest(StatusTaskAttribute);

export const attributeIsolationDueDate =
  makeAttributeIsolationTest(DueDateTaskAttribute);
