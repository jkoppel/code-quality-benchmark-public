#!/usr/bin/env node

import * as path from "path";
import { runBenchmarkWithNewCode } from "./benchmark-lib.js";
import { createShellAgent } from "./index.js";

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

// Create coding agent from shell script
const codingAgent = createShellAgent(resolvedScriptPath);

runBenchmarkWithNewCode(resolvedBenchmarkPath, codingAgent).catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
