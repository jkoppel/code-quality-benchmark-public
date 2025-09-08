import { Suite } from "../../../test-lib/suite.js";
import { appInfoReconFixtureMaker } from "./shared/scout-fixture.js";
import { checkMoreThanDoneNotDoneStatuses } from "./basic-tests/test-cases.js";
import {
  quickStateSynchStatus,
  quickStateSynchPriority,
  quickStateSynchDueDate,
} from "./state-synchronization-tests/test-cases.js";
import {
  attributeIsolationPriority,
  attributeIsolationStatus,
  attributeIsolationDueDate,
} from "./attribute-isolation-tests/test-cases.js";

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
