export { evaluate as eval, evaluateUpdates } from './evaluator.js';
export { 
  runBenchmarkWithNewCode, 
  runBenchmarkWithExistingCode,
  readBenchmarkPrompts,
  outputBenchmarkResults
} from './benchmark-lib.js';

export {
  CodingAgent,
  EvaluationConfig,
  EvaluationResult,
  InstanceResult,
  EvaluationMetadata,
  ClaudeAgentConfig,
  EvaluationError,
  AgentExecutionError
} from './types.js';

export { Logger, LogLevel, LogEntry } from './utils/logger.js';
export { ClaudeAgent } from './agents/feature-addition/claude-agent.js';
export { createShellAgent, defaultShellAgent } from './agents/shell-agent.js';