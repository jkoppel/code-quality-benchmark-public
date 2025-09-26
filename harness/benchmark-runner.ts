#!/usr/bin/env node

import * as path from "node:path";
import { runBenchmarkWithNewCode } from "./benchmark-lib.ts";
import { createShellAgent } from "./index.ts";
import { checkDependenciesPresent } from "./utils/validate-dependencies.ts";

// CLI interface
const benchmarkPath = process.argv[2];
const agentScriptPath = process.argv[3];

if (!benchmarkPath || !agentScriptPath) {
  console.error(
    "Usage: npm run benchmark <benchmark-path> <agent-script-path>",
  );
  console.error(
    "Example: npm run benchmark benchmarks/evolvability/calculator ./my-agent.sh",
  );
  process.exit(1);
}

const resolvedBenchmarkPath = path.resolve(benchmarkPath);
const resolvedScriptPath = path.resolve(agentScriptPath);

// Upfront checks for required dependencies
await checkDependenciesPresent();

// Create coding agent from shell script
const codingAgent = createShellAgent(resolvedScriptPath);

runBenchmarkWithNewCode(resolvedBenchmarkPath, codingAgent).catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
