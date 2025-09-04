#!/usr/bin/env node

import * as path from "path";

// Usage: benchmark:test-functionality <benchmark-path>
if (require.main === module) {
  const benchmarkPath = process.argv[2];

  if (!benchmarkPath) {
    console.error("Usage: benchmark:test-functionality <benchmark-path>");
    console.error(
      "Example: benchmark-runner-existing benchmarks/evolvability/calculator /tmp/benchmark-xxx/original-program",
    );
    process.exit(1);
  }

  const resolvedBenchmarkPath = path.resolve(benchmarkPath);

  console.log("TODO: the rest has not been implemented");
}
