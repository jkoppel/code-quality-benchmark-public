import dedent from "dedent";
import type * as z from "zod";
import { jsonStringify } from "../../../../utils/logger/pretty.ts";
import type { DiscoveryAgent } from "../../../test-lib/agents/discovery-agent.ts";
import { makeBaseToolsPrompt } from "../../../test-lib/common-prompts.ts";
import { TestContext } from "../../../test-lib/context.ts";
import type { TestRunnerConfig } from "../../../test-lib/runner.ts";
import type { SuiteGenerationStrategy } from "../../../test-lib/suite.ts";
import { Suite } from "../../../test-lib/suite.ts";
import {
  attributeIsolationDueDate,
  attributeIsolationPriority,
  attributeIsolationStatus,
} from "./attribute-isolation-tests/test-cases.ts";
import {
  moreThanDoneNotDoneStatuses,
  tasksHavePriorities,
} from "./basic-tests/test-cases.ts";
import { TodoListAppInfo } from "./shared/app-info-schema.ts";
import { makePerMutatorStateSyncTestsForStatus } from "./state-synchronization-tests/test-factory.ts";

export const appInfoId = "todoListAppInfo";

/************************************************
         TodoListTestStrategy
************************************************/

export const strategy: SuiteGenerationStrategy = {
  async discover(config: TestRunnerConfig, discoveryAgent: DiscoveryAgent) {
    return await discoverTodoListAppInfo(discoveryAgent, config);
  },

  // biome-ignore lint/suspicious/useAwait: This generateSuite doesn't need to be async, but there could be SuiteGenerationStrategies with generateSuites that do need to be async
  async generateSuite(_config: TestRunnerConfig, context: TestContext) {
    const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;

    // Dynamically generate tests based on the app info:
    // For each mutator that was identified in the previous discovery phase, we test that changing the status via that mutator updates the other views accordingly.
    // TODO: Starting with just status to demonstrate the approach; can generalize to priority levels and due dates in the future
    const dynamicTests = [
      ...makePerMutatorStateSyncTestsForStatus(appInfo, {
        from: "not-done",
        to: "done",
      }),
      ...makePerMutatorStateSyncTestsForStatus(appInfo, {
        from: "done",
        to: "not-done",
      }),
    ];

    const staticTests = [
      // Basic tests
      moreThanDoneNotDoneStatuses,
      tasksHavePriorities,

      // 'I'm feeling lucky' State synchronization tests
      // Commented these out because these don't have as a high a detection rate as the per-mutator tests;
      // they also are not constrained enough (so there are occasional false positives).
      // But haven't removed them totally because it's helpful in the short term to be able to cross check the per-mutator tests with these.
      // chanceyStateSynchStatus,
      // chanceyStateSynchPriority,
      // chanceyStateSynchDueDate,

      // Attribute isolation tests
      attributeIsolationPriority,
      attributeIsolationStatus,
      attributeIsolationDueDate,
    ];

    return new Suite("Todolist Functionality Tests", [
      ...staticTests,
      ...dynamicTests,
    ]);
  },
};

export default strategy;

/************************************************
         discoverTodoListAppInfo
************************************************/

export async function discoverTodoListAppInfo(
  discoveryAgent: DiscoveryAgent,
  config: TestRunnerConfig,
): Promise<TestContext> {
  const appInfo = await discoveryAgent.query(
    dedent`
      You are a senior developer trying to piece together a preliminary understanding of this program,
      to help downstream testers test its functionality.

      <spec-of-system-under-test>
      This is a React todo list app where you can add, remove, and edit tasks.
      A user should be able to create and delete todo items, view the TodoList, and mark items as done.
      The app has also been extended to support the following features:
        * Assigning more statuses to todo items, in addition to the existing done/not-done (e.g.: in-progress, under review, blocked)
        * Assign priorities to todo items
        * Adding due dates to todo items
      </spec-of-system-under-test>
      This specification deliberately leaves a lot open. For instance,
      some apps might expose a task's status via both a checkbox and a dropdown menu;
      others might only have one way to observe and change it.
      That's where you come in. Part of your job is to investigate and explain the design decisions that
      the system under test has made, especially with regards to state and how it is exposed to users
      (see the following schema for exactly what info to collect).

      More concretely, here's what you should do.
      ${makeBaseToolsPrompt(config.getSutConfig())}
      0. Read the schema to understand exactly what information you need to collect.
      1. Skim the code and make a rough plan for what UI interactions you *minimally* need to do to collect the requested information; in particular, what you need to do to uncover key decision decisions regarding state, how it's exposed, and potential functional bugs.
      2. Interact with the app; collect and return that information.
      If there's stuff you can't figure out, try to at least offer suggestions for what paths through the UI to investigate or look at.
      Your goal is *not* to actually test the app -- it's merely to investigate the decision decisions, enumerate all the UI / views for the various pieces of state, and flag potential issues for other testers to investigate in more depth.
      That said, although you aren't testing the app, you still need to investigate it thoroughly enough that downstream testers can figure out what they should be testing.`,
    TodoListAppInfo,
  );
  config
    .getLogger()
    .info(`DiscoveryAgent app info:\n${jsonStringify(appInfo)}`);
  return new TestContext(new Map([[appInfoId, appInfo]]));
}
