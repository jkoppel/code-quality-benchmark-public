import type { PermissionMode } from "@anthropic-ai/claude-code";
import dedent from "dedent";
import { match } from "ts-pattern";
import type * as z from "zod";
import { getLoggerConfig, type Logger } from "../../utils/logger/logger.js";
import { jsonStringify } from "../../utils/logger/pretty.js";
import { DriverAgent, type DriverAgentConfig } from "./driver-agent.js";
import type { TestResult } from "./report.js";
import { TestResultSchema } from "./report.js";
import type { SutConfig } from "./runner.js";

/*************************************
  Test Case Agent Options
***************************************/

// Looks like only two eral differences between vision and non-vision: the driver agent config and the prompt
// Could maybe reify that into a TestCaseAgentConfig?

export type OptionalTestCaseAgentCapability = "vision";

export interface TestCaseAgentOptions {
  additionalCapabilities: OptionalTestCaseAgentCapability[];
}

/*************************************
  Test Case Agent
***************************************/

interface TestCaseAgentInternalConfig {
  driverConfig: DriverAgentConfig;
  checkPromptPrefix: string;
}

// TODO: Maybe just remove this now that we only have one test case agent class
/** Each test case gets a new instance of the TestCaseAgent */
export interface ITestCaseAgent {
  check(instructions: string): Promise<TestResult>;
  query<T extends z.ZodType>(
    prompt: string,
    outputSchema: T,
  ): Promise<z.infer<T>>;
}

// TODO: try to streamline this; feels too complicated
export function makeTestCaseAgent(
  options: TestCaseAgentOptions,
  sutConfig: SutConfig,
  logger?: Logger,
): TestCaseAgent {
  function makeVisionTestCaseAgentInternalConfig(
    sutConfig: SutConfig,
  ): TestCaseAgentInternalConfig {
    const driverConfig = {
      ...VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG,
      cwd: sutConfig.folderPath,
    };
    return {
      driverConfig,
      checkPromptPrefix: dedent`
        Available tools include the standard Playwright MCP capabilities as well as the vision capabilities (which enable, e.g., coordinate-based clicking).
        If you have a choice between using vision capabilities like coordinate-based clicking and using the evaluate JS tool, use the vision capabilities (so, e.g., use those to click, instead of evaluating JS).
        Using these tools, check the following: `,
    };
  }

  function makeNonVisionTestCaseAgentConfig(
    sutConfig: SutConfig,
  ): TestCaseAgentInternalConfig {
    const driverConfig = {
      ...NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG,
      cwd: sutConfig.folderPath,
    };
    return {
      driverConfig,
      checkPromptPrefix: dedent`Check the following: `,
    };
  }

  const config = match(options.additionalCapabilities)
    .when(
      (caps) => caps.includes("vision"),
      () => makeVisionTestCaseAgentInternalConfig(sutConfig),
    )
    .otherwise(() => makeNonVisionTestCaseAgentConfig(sutConfig));

  return new TestCaseAgent(sutConfig, config, logger);
}

export class TestCaseAgent implements ITestCaseAgent {
  private driver: DriverAgent;
  private config: TestCaseAgentInternalConfig;

  constructor(
    readonly sutConfig: SutConfig,
    config: TestCaseAgentInternalConfig,
    private readonly logger: Logger = getLoggerConfig().logger,
  ) {
    this.config = config;
    this.driver = new DriverAgent(config.driverConfig, logger);
  }

  async check(instructions: string): Promise<TestResult> {
    const result = await this.driver.query(
      `${this.config.checkPromptPrefix}${instructions}`,
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

/***************************************************
  Claude Code config / options for Test Case Agent
****************************************************/

type PlaywrightMCPCapability = "verify" | "vision";

function makePlaywrightMCPConfig(capabilities: PlaywrightMCPCapability[]) {
  const PLAYWRIGHT_MCP = "@playwright/mcp@0.0.36";
  return {
    playwright: {
      type: "stdio" as const,
      command: "npx",
      args: [
        "-y",
        PLAYWRIGHT_MCP,
        "--isolated",
        "--headless",
        capabilities.length > 0 ? `--caps=${capabilities.join(",")}` : "",
      ],
    },
  };
}

// TODO: add a prompt explaining that this is a test case agent that will be used to ...
const CORE_TEST_CASE_AGENT_CONFIG = {
  permissionMode: "bypassPermissions" as const satisfies PermissionMode, // NOTE THIS
  maxTurns: 180, // TODO: Tune this
  executable: "node" as const,
  // Prohibiting js eval cos it does not reliably trigger state updates in the apps under test
  disallowedTools: ["mcp__playwright__browser_evaluate"],
};

export const NON_VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG: DriverAgentConfig =
  {
    ...CORE_TEST_CASE_AGENT_CONFIG,
    mcpServers: {
      ...makePlaywrightMCPConfig(["verify"]),
    },
  };

// TODO: Prob want to add a system prompt offering guidance for when to use Playwright vision caps, and to do that instead of e.g. eval js where possible
export const VISION_PLAYWRIGHT_MCP_TEST_CASE_AGENT_CONFIG: DriverAgentConfig = {
  ...CORE_TEST_CASE_AGENT_CONFIG,
  mcpServers: {
    ...makePlaywrightMCPConfig(["verify", "vision"]),
  },
};

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
