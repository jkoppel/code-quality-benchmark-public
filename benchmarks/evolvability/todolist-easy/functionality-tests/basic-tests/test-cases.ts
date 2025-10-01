import dedent from "dedent";
import type { Effect } from "effect";
import type * as z from "zod";
import type { DriverAgentError } from "../../../../../harness/benchmark-test-lib/agents/driver-agent.ts";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../../../harness/benchmark-test-lib/agents/test-case-agent.ts";
import type { TestContext } from "../../../../../harness/benchmark-test-lib/context.ts";
import type { TestResult } from "../../../../../harness/benchmark-test-lib/report.ts";
import type { TestRunnerConfig } from "../../../../../harness/benchmark-test-lib/runner.ts";
import type { TestCase } from "../../../../../harness/benchmark-test-lib/suite.ts";
import type { LoggerConfig } from "../../../../../harness/utils/logger/logger.ts";
import type { TodoListAppInfo } from "../shared/app-info-schema.ts";
import { makeBackgroundPrompt } from "../shared/common-prompts.ts";
import { appInfoId } from "../test-strategy.ts";

export const moreThanDoneNotDoneStatuses = makeTest({
  name: "Test that the app has more than done/not-done statuses",
  run(
    agent: TestCaseAgent,
    appInfo: z.infer<typeof TodoListAppInfo>,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}
      Here's some info that someone has collected about the app:
      ${JSON.stringify(appInfo)}

      Check if the app supports more statuses than just done/not-done.
      Mark the test as passing if there are more statuses than done/not-done.
      Mark as failing if there's only done/not-done (or worse).`);
  },
});

export const tasksHavePriorities = makeTest({
  name: "Test that the app has implemented priorities for tasks",
  run(
    agent: TestCaseAgent,
    appInfo: z.infer<typeof TodoListAppInfo>,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}
      Here's some info that someone has collected about the app:
      ${JSON.stringify(appInfo)}

      Check if the app supports assigning priorities to todo items.
      Mark the test as passing if it does, and as failing if it doesn't.`);
  },
});

/***************************************
         makeTest helper
****************************************/

interface TodoListTestOptions {
  name: string;
  run(
    agent: TestCaseAgent,
    appInfo: z.infer<typeof TodoListAppInfo>,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig>;
}

function makeTest({ name, run }: TodoListTestOptions): TestCase {
  return {
    descriptiveName: name,
    run(
      makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
      context: TestContext,
      config: TestRunnerConfig,
    ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
      const agent = makeAgent({ additionalCapabilities: [] });
      const appInfo = context.get(appInfoId) as z.infer<typeof TodoListAppInfo>;
      return run(agent, appInfo, config);
    },
  };
}
