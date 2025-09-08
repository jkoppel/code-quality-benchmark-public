import type {
  FixtureAgent,
  FixtureMaker,
} from "../../../../test-lib/fixture.js";
import type { SutConfig } from "../../../../test-lib/runner.js";
import { TodoListAppInfo } from "./app-info-schema.js";
import { makeToolsInfoPrompt } from "./common-prompts.js";
import dedent from "dedent";

export const appInfoFixtureId = "todoListAppInfo";

export const appInfoReconFixtureMaker: FixtureMaker = {
  id: appInfoFixtureId,
  async initialize(agent: FixtureAgent, config: SutConfig) {
    return await agent.query(
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
        ${makeToolsInfoPrompt(config)}
        0. Read the schema to understand exactly what information you need to collect.
        1. Skim the code and make a rough plan for what UI interactions you *minimally* need to do to collect the requested information; in particular, what you need to do to uncover key decision decisions regarding state, how it's exposed, and potential functional bugs.
        2. Collect and return that information.
        If there's stuff you can't figure out, try to at least offer suggestions for what paths through the UI to investigate or look at.
        Your goal is *not* to actually test the app -- it's merely to investigate the decision decisions, enumerate all the UI / views for the various pieces of state, and flag potential issues for other testers to investigate in more depth.
        That said, although you aren't testing the app, you still need to investigate it thoroughly enough that downstream testers can figure out what they should be testing.`,
      TodoListAppInfo,
    );
  },
};
