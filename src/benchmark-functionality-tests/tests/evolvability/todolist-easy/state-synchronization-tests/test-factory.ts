import type * as z from "zod";
import {
  type TaskAttribute,
  StatusTaskAttribute,
} from "../shared/task-attribute.js";
import type { TestContext } from "../../../../test-lib/context.js";
import type { TestResult } from "../../../../test-lib/report.js";
import type { TestCase } from "../../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../../test-lib/test-case-agent.js";
import type { TestRunnerConfig } from "../../../../test-lib/runner.js";
import type { TodoListAppInfo } from "../shared/app-info-schema.js";
import { makeBackgroundPrompt } from "../shared/common-prompts.js";
import { appInfoId } from "../test-strategy.js";
import dedent from "dedent";

/**********************************************************
  'I'm feeling lucky' State Synchronization Test Factory
***********************************************************/

/** Make a 'I'm feeling lucky' state synchronization test case */
export function makeChanceyStateSynchTest(attribute: TaskAttribute): TestCase {
  return {
    descriptiveName: `Test state synchronization of ${attribute.getPrettyName()} state (if applicable)`,
    async run(
      agent: NonVisionTestCaseAgent,
      context: TestContext,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;
      config.logger.debugWith(appInfo, "AppInfo fixture");

      return await agent.check(dedent`
        ${makeBackgroundPrompt(config)}
        Here is some information that someone else gathered about the views of or UI elements for the ${attribute.getPrettyName()} (and related things):
        ${attribute.getInfoForStateSynchTests(appInfo)}

        Your overall goal is to test synchronization of ${attribute.getPrettyName()}, broadly construed, as well as any synchronizations of this state with other key pieces of state.
        In particular:
        1. Skim the relevant code for more context -- it'll help with knowing what to focus on testing.
        2. Think about the specification and what UI paths you have to explore to *thoroughly* test such synchronization before doing it.
        E.g., if the ${attribute.getPrettyName()} is exposed in two ways, check if (i) changing it via one way also updates the other view and (ii) changing it via the other view also updates the first view.

        Then evaluate as follows:
        * If the ${attribute.getPrettyName()} is only exposed in one way and there are no interactions with other pieces of state, mark the test as passing.
        * If the ${attribute.getPrettyName()} is exposed in more than one way in the UI, check if this state has been synchronized correctly across the different views.

        Examples of synchronization failures:
        - For an app with both an icon/badge and a text label for the status: Status icon updates but text label doesn't change
        - For an app with both a detailed view and a summary view: Status changes in the detailed view but not in the summary view
        `);
    },
  };
}

/**********************************************************
      Per Mutator State Synchronization Test Factory
***********************************************************/
// TODO: Not sure what a good name for this is.

/** Don't need to check the code for these more constrained tests */
const makeJustPlaywrightToolsPrompt = (config: TestRunnerConfig) => dedent`
  You can use Playwright MCP; the dev server has been started at port ${config.port}.`;

// TODO: Starting with just status to demonstrate the approach; can generalize to priority levels and due dates in the future
/** Make more thorough tests for status synchronization based on the app info.
 * For each mutator, test that changing the status via that mutator
 * updates the other views accordingly.
 *
 * The key insight is that the app info identified by the discovery phase tends to be reliable,
 * and the info there is enough for us to test this sort of test synchronization without leaving too much to the coding agent.
 */
export function makePerMutatorStateSyncTestsForStatus(
  appInfo: z.infer<typeof TodoListAppInfo>,
  fromStatus: string,
  toStatus: string,
): Array<TestCase> {
  const attribute = StatusTaskAttribute;
  const mutators = attribute
    .getAttributeViews(appInfo)
    .views.filter((view) => view.viewType === "mutator");
  return mutators.map((mutator) => {
    return {
      descriptiveName: `Per-mutator state synchronization test - ${attribute.getPrettyName()}`,
      async run(
        agent: NonVisionTestCaseAgent,
        _context: TestContext,
        config: TestRunnerConfig,
      ): Promise<TestResult> {
        return await agent.check(dedent`
            You are testing synchronization of ${attribute.getPrettyName()} in a Todo list app.
            ${makeJustPlaywrightToolsPrompt(config)}
            
            Here is some information that someone else has gathered:
            * The available statuses are ${JSON.stringify(attribute.getAttributeValuesForTesting(appInfo))}.
            * The views or UI elements are:
              ${attribute.getInfoForStateSynchTests(appInfo)}

            Test state synchronization by
            1. Creating a task with the status ${fromStatus}
            2. Then change the status to ${toStatus} by using ${mutator}
            3. Finally, check if the other views update accordingly.
            The test passes if and only if all the other views update accordingly.
          `);
      },
    };
  });
}
