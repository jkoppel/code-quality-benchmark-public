import dedent from "dedent";
import type * as z from "zod";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../../../harness/benchmark-test-lib/agents/test-case-agent.ts";
import { makeBaseToolsPrompt } from "../../../../../harness/benchmark-test-lib/common-prompts.ts";
import type { TestContext } from "../../../../../harness/benchmark-test-lib/context.ts";
import type { TestResult } from "../../../../../harness/benchmark-test-lib/report.ts";
import type { TestRunnerConfig } from "../../../../../harness/benchmark-test-lib/runner.ts";
import type { TestCase } from "../../../../../harness/benchmark-test-lib/suite.ts";
import type { TodoListAppInfo } from "../shared/app-info-schema.ts";
import { makeBackgroundPrompt } from "../shared/common-prompts.ts";
import {
  StatusTaskAttribute,
  type TaskAttribute,
} from "../shared/task-attribute.ts";
import { appInfoId } from "../test-strategy.ts";

/**********************************************************
      Per Mutator State Synchronization Test Factory
***********************************************************/
// TODO: Not sure what a good name for this is.

export type StateTransition = {
  from: string;
  to: string;
};

// TODO: Starting with just status to demonstrate the approach; can generalize to priority levels and due dates in the future
/** Make tests for status synchronization based on the app info that
 * (i) are more systematic and
 * (ii) more constrained (e.g., we don't explicitly prompt the agent to check the code).
 * In particular, for each mutator, test that changing the status via that mutator
 * updates the other views accordingly.
 *
 * The key insight, I think, is that
 * (i) the discovery phase allows us to collect key info about the app under test
 * (ii) we don't actually need that much info to test this sort of test synchronization systematically, without leaving too much to the coding agent,
 * which in effect makes the discovery task simpler / more reliable. E.g., we don't need the discovery agent to actually identify bugs -- just need it to identify key UI elements and which are mutators.
 */
export function makePerMutatorStateSyncTestsForStatus(
  appInfo: z.infer<typeof TodoListAppInfo>,
  stateTransition: StateTransition,
): Array<TestCase> {
  const attribute = StatusTaskAttribute;
  const mutators = attribute
    .getAttributeViews(appInfo)
    .views.filter((view) => view.viewType === "mutator");
  return mutators.map((mutator) => {
    // TODO: Could make this more robust
    const mutatorName = mutator.shortDescription
      .trim()
      .split(" ")
      .slice(0, 2)
      .join(" ");
    return {
      descriptiveName: `Per-mutator state synch: ${attribute.getPrettyName()}/${mutatorName}/${stateTransition.from}->${stateTransition.to}`,
      async run(
        makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
        _context: TestContext,
        config: TestRunnerConfig,
      ): Promise<TestResult> {
        const agent = makeAgent({ additionalCapabilities: [] });
        // TODO: Consider putting info on the views for ALL attributes -- test case agent sometimes gets confused about what some bit of ui represents
        return await agent.check(dedent`
            You are testing synchronization of ${attribute.getPrettyName()} in a Todo list app.
            ${makeBaseToolsPrompt(config.getSutConfig())}
            
            Here is some information that someone else has gathered:
            * The available values for ${attribute.getPrettyName()} are ${JSON.stringify(attribute.getAttributeValues(appInfo))}.
            * The views or UI elements are:
              ${attribute.getInfoForStateSynchTests(appInfo)}
            (Trust but verify: explore the app to understand the UI better yourself, if necessary.)

            Test state synchronization by
            1. Creating a task with the status ${stateTransition.from}
            2. Then change the status to ${stateTransition.to} by using ${JSON.stringify(mutator)}
            3. Finally, check if the other views update accordingly.
            The test passes if and only if all the other views update accordingly.

            Before concluding that a test fails, make sure to check if what you think are views for ${attribute.getPrettyName()} really are views for it.
          `);
      },
    };
  });
}

/*******************************************************************
  (Obsolete but keeping around for comparison in the short term) 
  'I'm feeling lucky' State Synchronization Test Factory
********************************************************************/

/** Make a 'I'm feeling lucky' state synchronization test case */
export function makeChanceyStateSynchTest(attribute: TaskAttribute): TestCase {
  return {
    descriptiveName: `Test state synchronization of ${attribute.getPrettyName()} state (if applicable)`,
    async run(
      makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
      context: TestContext,
      config: TestRunnerConfig,
    ): Promise<TestResult> {
      const agent = makeAgent({ additionalCapabilities: [] });
      const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;
      config.getLogger().withMetadata(appInfo).debug("AppInfo fixture");

      return await agent.check(dedent`
        ${makeBackgroundPrompt(config.getSutConfig())}
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
