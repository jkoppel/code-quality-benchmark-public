import { Suite, type NonVisionTestCase } from '../../../test-lib/suite.js';
import type { TestResult } from '../../../test-lib/report.js';
import type { NonVisionTestCaseAgent } from '../../../test-lib/test-case-agent.js';

const toyTest: NonVisionTestCase = {
  description: 'Toy test that always passes',
  async run(_agent: NonVisionTestCaseAgent): Promise<TestResult> {
    return {
      name: 'Toy test that always passes',
      outcome: {
        status: 'passed',
        howTested: 'This is a constant test that always returns passed for e2e testing'
      }
    };
  }
};

export default new Suite('Todolist Easy Toy Tests', [toyTest]);