export { evaluate as eval, evaluateUpdates } from './evaluator';
export { 
  runBenchmarkWithNewCode, 
  runBenchmarkWithExistingCode,
  readBenchmarkPrompts,
  outputBenchmarkResults
} from './benchmark-lib';

export {
  CodingAgent,
  EvaluationConfig,
  EvaluationResult,
  InstanceResult,
  EvaluationMetadata,
  ClaudeAgentConfig,
  EvaluationError,
  AgentExecutionError
} from './types';

export { Logger, LogLevel, LogEntry } from './utils/logger';
export { ClaudeAgent } from './agents/feature-addition/claude-agent';
export { createShellAgent, defaultShellAgent } from './agents/shell-agent';