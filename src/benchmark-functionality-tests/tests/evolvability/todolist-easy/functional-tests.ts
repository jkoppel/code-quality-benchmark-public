import type { TestResult } from "../../../test-lib/report.js";
import { type NonVisionTestCase, Suite } from "../../../test-lib/suite.js";
import type { NonVisionTestCaseAgent } from "../../../test-lib/test-case-agent.js";

const toyTest: NonVisionTestCase = {
  type: "non-vision",
  description: "Toy test that always passes",
  async run(): Promise<TestResult> {
    return {
      name: "Toy test that always passes",
      outcome: {
        status: "passed",
        howTested: "This is a constant test that always returns passed for e2e testing",
      },
    };
  },
};

// Simple test case to check if can call CC
const agentAlwaysPassesTest: NonVisionTestCase = {
  type: "non-vision",
  description: "Simple agent response test",
  async run(agent: NonVisionTestCaseAgent): Promise<TestResult> {
    return await agent.check("Respond with a test result indicating this test passed");
  },
};

export default new Suite("Todolist Easy Toy Tests", [toyTest, agentAlwaysPassesTest]);
