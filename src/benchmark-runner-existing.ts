#!/usr/bin/env node

import { runBenchmarkWithExistingCode } from './benchmark-lib.js';
import * as path from 'path';

// CLI interface
const benchmarkPath = process.argv[2];
const existingCodePath = process.argv[3];

if (!benchmarkPath || !existingCodePath) {
  console.error('Usage: benchmark-runner-existing <benchmark-path> <existing-code-path>');
  console.error('Example: benchmark-runner-existing benchmarks/evolvability/calculator /tmp/benchmark-xxx/original-program');
  process.exit(1);
}

const resolvedBenchmarkPath = path.resolve(benchmarkPath);
const resolvedCodePath = path.resolve(existingCodePath);

runBenchmarkWithExistingCode(resolvedBenchmarkPath, resolvedCodePath).catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});