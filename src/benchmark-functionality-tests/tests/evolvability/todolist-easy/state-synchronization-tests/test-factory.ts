import * as z from "zod";
import type { FixturesEnv } from "../../../../test-lib/fixture.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { NonVisionTestCase } from "../../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../../test-lib/test-case-agent.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoFixtureId } from "../shared/scout-fixture.js";
import dedent from "dedent";

/**********************************************************
  'I'm feeling lucky' State Synchronization Test Factory
***********************************************************/

/** Make a 'I'm feeling lucky' state synchronization test case */
export function makeStateSynchTest(
  testName: string,
  stateName: string,
  viewsExtractor: (appInfo: z.infer<typeof TodoListAppInfo>) => string,
  overallGoal: string = `Your overall goal is to test synchronization of ${stateName.toLowerCase()}, broadly construed, as well as any synchronizations of this state with other key pieces of state`,
): NonVisionTestCase {
  return {
    type: "non-vision" as const,
    description: testName,
    async run(
      agent: NonVisionTestCaseAgent,
      fixtures: FixturesEnv,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const appInfo = fixtures.get(appInfoFixtureId) as z.infer<
        typeof TodoListAppInfo
      >;
      config.logger.debugWith(appInfo, "AppInfo fixture");

      const views = viewsExtractor(appInfo);

      return agent.check(dedent`
        ${makeBackgroundPrompt(config)}
        Here is some information that someone else gathered about the views of or UI elements for the ${stateName} (and related things):
        ${views}

        ${overallGoal}
        In particular:
        1. Skim the relevant code for more context -- it'll help with knowing what to focus on testing.
        2. Think about the specification and what UI paths you have to explore to *thoroughly* test such synchronization before doing it.
        E.g., if the ${stateName} is exposed in two ways, check if (i) changing it via one way also updates the other view and (ii) changing it via the other view also updates the first view.

        Then evaluate as follows:
        * If the ${stateName} is only exposed in one way and there are no interactions with other pieces of state, mark the test as passing.
        * If the ${stateName} is exposed in more than one way in the UI, check if this state has been synchronized correctly across the different views.

        Examples of synchronization failures:
        - For an app with both an icon/badge and a text label for the status: Status icon updates but text label doesn't change
        - For an app with both a detailed view and a summary view: Status changes in the detailed view but not in the summary view
        `);
    },
  };
}
