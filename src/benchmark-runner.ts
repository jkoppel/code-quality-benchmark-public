#!/usr/bin/env node

import { createShellAgent } from './index.js';
import { runBenchmarkWithNewCode } from './benchmark-lib.js';
import * as path from 'path';

// CLI interface
const benchmarkPath = process.argv[2];
const agentScriptPath = process.argv[3];

if (!benchmarkPath || !agentScriptPath) {
  console.error('Usage: benchmark-runner <benchmark-path> <agent-script-path>');
  console.error('Example: benchmark-runner benchmarks/evolvability/calculator ./my-agent.sh');
  process.exit(1);
}

const resolvedBenchmarkPath = path.resolve(benchmarkPath);
const resolvedScriptPath = path.resolve(agentScriptPath);

// Create coding agent from shell script
const codingAgent = createShellAgent(resolvedScriptPath);

runBenchmarkWithNewCode(resolvedBenchmarkPath, codingAgent).catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});