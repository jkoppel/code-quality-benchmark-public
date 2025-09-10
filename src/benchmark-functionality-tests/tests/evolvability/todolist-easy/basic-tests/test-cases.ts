import dedent from "dedent";
import type * as z from "zod";
import type { TestContext } from "../../../../test-lib/context.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TestCase } from "../../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../../test-lib/test-case-agent.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoId } from "../test-strategy.js";

export const checkMoreThanDoneNotDoneStatuses: TestCase = {
  descriptiveName: "Test that the app has more than done/not-done statuses",
  async run(
    agent: NonVisionTestCaseAgent,
    context: TestContext,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;
    const availableStatuses = appInfo.taskInfo.statuses;

    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      The app has these available statuses: ${JSON.stringify(availableStatuses)}

      Check if this todo app supports more statuses than just done/not-done.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
};
