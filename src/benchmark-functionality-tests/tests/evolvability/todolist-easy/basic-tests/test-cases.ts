import dedent from "dedent";
import type * as z from "zod";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../../test-lib/agents/test-case-agent.js";
import type { TestContext } from "../../../../test-lib/context.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TestCase } from "../../../../test-lib/suite.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoId } from "../test-strategy.js";

export const moreThanDoneNotDoneStatuses: TestCase = {
  descriptiveName: "Test that the app has more than done/not-done statuses",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({ additionalCapabilities: [] });
    const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;

    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      Here's some info that someone has collected about the app:
      ${JSON.stringify(appInfo)}

      Check if the app supports more statuses than just done/not-done.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
};

export const tasksHavePriorities: TestCase = {
  descriptiveName: "Test that the app has implemented priorities for tasks",
  async run(
    makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
    context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const agent = makeAgent({ additionalCapabilities: [] });
    const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;

    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      Here's some info that someone has collected about the app:
      ${JSON.stringify(appInfo)}

      Check if the app supports assigning priorities to todo items.
      Mark the test as passing if it does, and as failing if it doesn't.`);
  },
};
