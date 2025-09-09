import type * as z from "zod";
import type { FixturesEnv } from "../../../../test-lib/fixture.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { TestCase } from "../../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../../test-lib/test-case-agent.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoFixtureId } from "../shared/scout-fixture.js";
import dedent from "dedent";

export const checkMoreThanDoneNotDoneStatuses: TestCase = {
  description: "Test that the app has more than done/not-done statuses",
  async run(
    agent: NonVisionTestCaseAgent,
    fixtures: FixturesEnv,
    config: TestRunnerConfig,
  ): Promise<TestResult> {
    const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
      typeof TodoListAppInfo
    >;
    const availableStatuses = appInfo.taskInfo.statuses;

    return await agent.check(dedent`
      ${makeBackgroundPrompt(config)}
      The app has these available statuses: ${JSON.stringify(availableStatuses)}

      Check if this todo app supports more statuses than just done/not-done.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
};
