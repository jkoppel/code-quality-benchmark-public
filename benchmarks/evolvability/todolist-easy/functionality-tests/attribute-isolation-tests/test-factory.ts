import dedent from "dedent";
import type * as z from "zod";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../../../harness/benchmark-functionality-tests/test-lib/agents/test-case-agent.ts";
import type { TestContext } from "../../../../../harness/benchmark-functionality-tests/test-lib/context.ts";
import type { TestResult } from "../../../../../harness/benchmark-functionality-tests/test-lib/report.ts";
import type { TestRunnerConfig } from "../../../../../harness/benchmark-functionality-tests/test-lib/runner.ts";
import type { TestCase } from "../../../../../harness/benchmark-functionality-tests/test-lib/suite.ts";
import type { TodoListAppInfo } from "../shared/app-info-schema.ts";
import { makeBackgroundPrompt } from "../shared/common-prompts.ts";
import type { TaskAttribute } from "../shared/task-attribute.ts";
import { generateDiverseTaskConfigs } from "../shared/utils.ts";
import { appInfoId } from "../test-strategy.ts";

/*************************************
    Attribute Isolation Test Factory
***************************************/

export function makeAttributeIsolationTest(attribute: TaskAttribute): TestCase {
  return {
    descriptiveName: `Test that changing a task's ${attribute.getPrettyName()} doesn't affect other tasks`,
    async run(
      makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
      context: TestContext,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const agent = makeAgent({ additionalCapabilities: [] });
      const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;
      const availableStatuses = appInfo.taskInfo.statuses;
      const availablePriorities = appInfo.taskInfo.priorityLevels;
      const taskConfigs = generateDiverseTaskConfigs(
        availableStatuses,
        availablePriorities,
      );

      const prompt = dedent`
        ${makeBackgroundPrompt(config.getSutConfig())}
        Test attribute isolation for ${attribute.getPrettyName()}.

        Available statuses in this app: ${JSON.stringify(availableStatuses)}
        Available priority levels in this app: ${JSON.stringify(availablePriorities)}

        Your task:
        1. Create 3 tasks with diverse attribute values to exercise different states:
           - Task 1: ${taskConfigs[0]}
           - Task 2: ${taskConfigs[1]}
           - Task 3: ${taskConfigs[2]}
        2. Record the initial state of all 3 tasks
        3. Change task 1's ${attribute.getPrettyName()} to a different value
        4. Verify that tasks 2 and 3 retain ALL their original attributes (priority, due date, status)

        Mark the test as passing if changing task 1's ${attribute.getPrettyName()} doesn't affect any attributes of the other tasks.
        Mark as failing if any other task's attributes changed.`;

      config
        .getLogger()
        .withMetadata({ prompt })
        .debug("Attribute isolation test prompt");
      return await agent.check(prompt);
    },
  };
}
