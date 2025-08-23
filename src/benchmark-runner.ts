#!/usr/bin/env node

import { eval as evaluate, createShellAgent } from './index';
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
export async function runBenchmark(benchmarkPath: string, codingAgent: (prompt: string, folderPath: string, port?: number) => Promise<void>): Promise<void> {
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
      logLevel: 'info'
    }
  );

  // Output benchmark results as JSON
  const successCount = result.updates.filter(u => u.success).length;
  const totalUpdates = result.updates.length;
  
  // Calculate per-agent success rates
  const agentStats: { [key: string]: { successful: number; total: number; totalScore: number } } = {};
  result.updates.forEach(u => {
    if (!agentStats[u.agentName]) {
      agentStats[u.agentName] = { successful: 0, total: 0, totalScore: 0 };
    }
    agentStats[u.agentName].total++;
    agentStats[u.agentName].totalScore += u.score;
    if (u.success) {
      agentStats[u.agentName].successful++;
    }
  });
  
  const updates = result.updates.map(u => ({
    instance: u.instanceId,
    agent: u.agentName,
    success: u.success,
    score: u.score,
    diffStats: u.diffStats || { filesChanged: 0, insertions: 0, deletions: 0 },
    executionTime: u.executionTime
  }));
  
  console.log(JSON.stringify({
    benchmark: benchmarkName,
    workspacePath: result.originalProgramPath.replace('/original-program', ''),
    resultsFile: path.join(result.originalProgramPath.replace('/original-program', ''), 'evaluation-results.json'),
    total_score: result.totalScore,
    success_rate: (successCount / totalUpdates) * 100,
    successful_updates: successCount,
    total_updates: totalUpdates,
    duration_ms: result.metadata.totalDuration,
    agent_stats: Object.entries(agentStats).map(([agent, stats]) => ({
      agent,
      success_rate: (stats.successful / stats.total) * 100,
      successful: stats.successful,
      total: stats.total,
      total_score: stats.totalScore
    })),
    updates
  }, null, 2));

  // Exit with appropriate code (success if all updates succeeded)
  process.exit(successCount === totalUpdates ? 0 : 1);
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