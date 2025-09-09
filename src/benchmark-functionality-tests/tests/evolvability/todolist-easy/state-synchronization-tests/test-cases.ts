import {
  DueDateTaskAttribute,
  PriorityTaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.js";
import { makeStateSynchTest } from "./test-factory.js";

/**********************************************************
    'I'm feeling lucky' state synchronization test cases
***********************************************************/

export const quickStateSynchStatus = makeStateSynchTest(StatusTaskAttribute);

export const quickStateSynchPriority = makeStateSynchTest(
  PriorityTaskAttribute,
);

export const quickStateSynchDueDate = makeStateSynchTest(DueDateTaskAttribute);
