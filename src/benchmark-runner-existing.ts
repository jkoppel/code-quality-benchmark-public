#!/usr/bin/env node

import * as path from "node:path";
import { runBenchmarkWithExistingCode } from "./benchmark-lib.js";

// CLI interface
const benchmarkPath = process.argv[2];
const existingCodePath = process.argv[3];

if (!benchmarkPath || !existingCodePath) {
  console.error(
    "Usage: npm run benchmark:existing <benchmark-path> <existing-code-path>",
  );
  console.error(
    "Example: npm run benchmark:existing benchmarks/evolvability/calculator /tmp/benchmark-xxx/original-program",
  );
  process.exit(1);
}

const resolvedBenchmarkPath = path.resolve(benchmarkPath);
const resolvedCodePath = path.resolve(existingCodePath);

runBenchmarkWithExistingCode(resolvedBenchmarkPath, resolvedCodePath).catch(
  (error) => {
    console.error("Benchmark failed:", error);
    process.exit(1);
  },
);
