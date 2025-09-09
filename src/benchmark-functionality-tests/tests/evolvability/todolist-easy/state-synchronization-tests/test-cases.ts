import {
  DueDateTaskAttribute,
  PriorityTaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.js";
import { makeChanceyStateSynchTest } from "./test-factory.js";

/**********************************************************
    'I'm feeling lucky' state synchronization test cases
***********************************************************/

export const chanceyStateSynchStatus =
  makeChanceyStateSynchTest(StatusTaskAttribute);

export const chanceyStateSynchPriority = makeChanceyStateSynchTest(
  PriorityTaskAttribute,
);

export const chanceyStateSynchDueDate =
  makeChanceyStateSynchTest(DueDateTaskAttribute);
