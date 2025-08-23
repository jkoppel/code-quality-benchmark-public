#!/usr/bin/env node

import { eval as evaluate, createShellAgent, CodingAgent } from './index';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Runs a benchmark from a given folder
 * Expected folder structure:
 * - initial-prompt.txt: The initial prompt for code generation
 * - update-prompt.txt: The update prompt for code evolution
 * 
 * The coding agent must be provided separately (e.g., via command line argument or environment variable)
 */
export async function runBenchmark(benchmarkPath: string, codingAgent: CodingAgent): Promise<void> {
  const benchmarkName = path.basename(benchmarkPath);
  
  // Read prompts from files
  const initialPromptPath = path.join(benchmarkPath, 'initial-prompt.txt');
  const updatePromptPath = path.join(benchmarkPath, 'update-prompt.txt');

  // Validate required files exist
  if (!await fs.pathExists(initialPromptPath)) {
    throw new Error(`Missing initial-prompt.txt in ${benchmarkPath}`);
  }
  if (!await fs.pathExists(updatePromptPath)) {
    throw new Error(`Missing update-prompt.txt in ${benchmarkPath}`);
  }

  const initialPrompt = await fs.readFile(initialPromptPath, 'utf-8');
  const updatePrompt = await fs.readFile(updatePromptPath, 'utf-8');

  // Run the evaluation
  const result = await evaluate(
    initialPrompt.trim(),
    codingAgent,
    updatePrompt.trim(),
    {
      logLevel: 'info',
      cleanupAfterRun: true
    }
  );

  // Output benchmark results as JSON
  const successCount = result.updates.filter(u => u.success).length;
  console.log(JSON.stringify({
    benchmark: benchmarkName,
    success_rate: (successCount / 3) * 100,
    successful_updates: successCount,
    total_updates: 3,
    duration_ms: result.metadata.totalDuration
  }, null, 2));

  // Exit with appropriate code
  process.exit(successCount === 3 ? 0 : 1);
}

// CLI interface
if (require.main === module) {
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
  
  runBenchmark(resolvedBenchmarkPath, codingAgent).catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
}