import dedent from "dedent";
import type * as z from "zod";
import { getLoggerConfig, type Logger } from "../../../utils/logger/logger.js";
import { jsonStringify } from "../../../utils/logger/pretty.js";
import type { TestResult } from "../report.js";
import { TestResultSchema } from "../report.js";
import type { SutConfig } from "../runner.js";
import { BASE_CONFIG } from "./base-driver-agent-config.js";
import { DriverAgent, makeDriverAgentConfig } from "./driver-agent.js";
import type { PlaywrightMCPCapability } from "./playwright-mcp-config.js";
import { makePlaywrightMCPConfig } from "./playwright-mcp-config.js";

/*************************************
  Test Case Agent Options
***************************************/

export type OptionalTestCaseAgentCapability = Extract<
  PlaywrightMCPCapability,
  "vision"
>;

export interface TestCaseAgentOptions {
  additionalCapabilities: OptionalTestCaseAgentCapability[];
}

function testCaseAgentCapabilitiesToPlaywrightCapabilities(
  capabilities: OptionalTestCaseAgentCapability[],
): PlaywrightMCPCapability[] {
  return capabilities;
}

/*************************************
  Test Case Agent
***************************************/

/** Base of the Claude-Code-specialized driver agent config for TestCaseAgent */
const baseForTestCaseAgent = {
  ...BASE_CONFIG,
  disallowedTools: ["mcp__playwright__browser_evaluate"],
};

export class TestCaseAgent {
  static make(
    options: TestCaseAgentOptions,
    sutConfig: SutConfig,
    logger?: Logger,
  ): TestCaseAgent {
    const driverConfig = makeDriverAgentConfig(
      baseForTestCaseAgent,
      makePlaywrightMCPConfig([
        "verify",
        ...testCaseAgentCapabilitiesToPlaywrightCapabilities(
          options.additionalCapabilities,
        ),
      ]),
      sutConfig,
    );
    const checkPromptPrefix = options.additionalCapabilities.includes("vision")
      ? dedent`
          Available tools include the standard Playwright MCP capabilities as well as vision capabilities (e.g., coordinate-based clicking and dragging).
          For instance, if you need to click or drag, use the vision capabilities (browser_mouse_click_xy, browser_mouse_drag_xy, etc) or keyboard navigation (but be efficient about it).
          Do not use mcp__playwright__browser_evaluate -- it's not reliable!
          Make sure to take screenshots and corroborate your conclusions against them -- it's not enough to rely on the DOM snapshots.`
      : "";

    return new TestCaseAgent(
      options,
      new DriverAgent(driverConfig, logger),
      checkPromptPrefix,
      logger,
    );
  }

  constructor(
    private readonly options: TestCaseAgentOptions,
    private readonly driver: DriverAgent,
    private readonly checkPromptPrefix: string,
    private readonly logger: Logger = getLoggerConfig().logger,
  ) {}

  private getCheckPromptPrefix() {
    return this.checkPromptPrefix;
  }

  getOptions() {
    return this.options;
  }

  async check(instructions: string): Promise<TestResult> {
    const result = await this.driver.query(
      dedent`
      ${this.getCheckPromptPrefix()}
      ${instructions}`,
      TestResultSchema,
    );
    this.logger.debug(`TestCaseAgent.check result: ${jsonStringify(result)}`);

    // Immediately log failed tests so user can abort without going through the rest of the suite
    if (result.outcome.status === "failed") {
      this.logger.error(
        `🔴 TEST FAILED: ${result.name} - ${result.outcome.reason}`,
      );
    }

    return result;
  }

  async query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
  ): Promise<z.infer<T>> {
    return await this.driver.query(prompt, outputSchema);
  }
}

/*
FUTURE WORK: Tool-based validation approach
============================================

The ideal solution would be to use Claude Code SDK's createSdkMcpServer and tool functions
to create a submit_response tool that validates JSON input automatically. This would:

1. Eliminate markdown parsing issues entirely
2. Provide self-correcting behavior - Claude gets validation errors and can retry
3. Use proper Zod schema validation built into the tool system

Example implementation (currently blocked by SDK bug https://github.com/anthropics/claude-code/issues/6710):

```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-code";

const submitResponseTool = tool(
  'submit_response',
  'Submit your test result using this tool. The input must be a valid TestResult object.',
  TestResultSchema.shape,
  async (args: TestResult) => {
    // Tool automatically validates args against TestResultSchema via Zod
    // Store result in closure variable for return
    testResult = args;
    return {
      content: [{ type: 'text' as const, text: 'Test result submitted successfully' }]
    };
  }
);

const validationMcpServer = createSdkMcpServer({
  name: 'validate-response-format',
  tools: [submitResponseTool]
});

// Add to DriverAgent config:
mcpServers: {
  'validate-response-format': validationMcpServer,
  ...existingServers
}

// Updated prompt:
"You must use the submit_response tool to submit your test result.
The tool expects a TestResult object with: name, outcome.status, outcome.howTested, etc."
```

Blocked by: relevant functions not exported from SDK even tho in sdk.d.ts
also xml approach seems ok
*/
