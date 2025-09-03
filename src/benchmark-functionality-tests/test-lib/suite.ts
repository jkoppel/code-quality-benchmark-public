import * as path from "node:path";
import fs from "fs-extra";
import { pathToFileURL } from "url";
import type { TestResult } from "./report.js";
import type { NonVisionTestCaseAgent, VisionTestCaseAgent } from "./test-case-agent.js";

export type TestCase = VisionTestCase | NonVisionTestCase;

export interface VisionTestCase {
  description: string;
  run(agent: VisionTestCaseAgent): Promise<TestResult>;
}

export interface NonVisionTestCase {
  description: string;
  run(agent: NonVisionTestCaseAgent): Promise<TestResult>;
}

export class Suite {
  constructor(
    /** Descriptive name */
    private name: string,
    private tests: TestCase[],
  ) {}

  getName() {
    return this.name;
  }

  getTests() {
    return this.tests;
  }
}

export async function loadTestSuite(benchmarkPath: string): Promise<Suite> {
  // Read the functionality-tests-info.json
  const infoPath = path.join(benchmarkPath, "functionality-tests-info.json");
  const info = await fs.readJSON(infoPath);

  // Convert src/ path to dist/ path for runtime
  const testsDir = info.testsDir.replace(/^src\//, "dist/");
  const resolvedTestsDir = path.resolve(testsDir);

  // Check if directory exists
  const exists = await fs.pathExists(resolvedTestsDir);
  if (!exists) {
    throw new Error(`Tests directory not found: ${resolvedTestsDir}`);
  }

  // Find the test file ending in "tests.js"
  const testFiles = await fs.readdir(resolvedTestsDir);
  const testFile = testFiles.find((file) => file.endsWith("tests.js") && !file.endsWith(".d.ts"));

  if (!testFile) {
    throw new Error(`No test file ending in "tests.js" found in ${resolvedTestsDir}`);
  }

  const filePath = path.join(resolvedTestsDir, testFile);
  const module = await import(pathToFileURL(filePath).href);

  if (!module.default || typeof module.default !== "object") {
    throw new Error(`Test file ${testFile} does not export a default Suite`);
  }

  return module.default as Suite;
}
