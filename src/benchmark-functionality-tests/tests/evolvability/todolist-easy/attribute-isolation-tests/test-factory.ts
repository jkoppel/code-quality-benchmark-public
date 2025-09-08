import * as z from "zod";
import type { TaskAttribute } from "../shared/task-attribute.js";
import type { FixturesEnv } from "../../../../test-lib/fixture.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { NonVisionTestCase } from "../../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../../test-lib/test-case-agent.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoFixtureId } from "../shared/scout-fixture.js";
import { generateDiverseTaskConfigs } from "../shared/utils.js";
import dedent from "dedent";

/*************************************
    Attribute Isolation Test Factory
***************************************/

export function makeAttributeIsolationTest(
  attribute: TaskAttribute,
): NonVisionTestCase {
  return {
    type: "non-vision" as const,
    description: `Test that changing a task's ${attribute} doesn't affect other tasks`,
    async run(
      agent: NonVisionTestCaseAgent,
      fixtures: FixturesEnv,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
        typeof TodoListAppInfo
      >;
      const availableStatuses = appInfo.taskInfo.statuses;
      const availablePriorities = appInfo.taskInfo.priorityLevels;
      const taskConfigs = generateDiverseTaskConfigs(
        availableStatuses,
        availablePriorities,
      );

      const prompt = dedent`
        ${makeBackgroundPrompt(config)}
        Test attribute isolation for ${attribute}.

        Available statuses in this app: ${JSON.stringify(availableStatuses)}
        Available priority levels in this app: ${JSON.stringify(availablePriorities)}

        Your task:
        1. Create 3 tasks with diverse attribute values to exercise different states:
           - Task 1: ${taskConfigs[0]}
           - Task 2: ${taskConfigs[1]}
           - Task 3: ${taskConfigs[2]}
        2. Record the initial state of all 3 tasks
        3. Change task 1's ${attribute} to a different value
        4. Verify that tasks 2 and 3 retain ALL their original attributes (priority, due date, status)

        Mark the test as passing if changing task 1's ${attribute} doesn't affect any attributes of the other tasks.
        Mark as failing if any other task's attributes changed.`;

      config.logger.debugWith({ prompt }, "Attribute isolation test prompt");
      return agent.check(prompt);
    },
  };
}
