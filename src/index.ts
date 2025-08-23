export { evaluate as eval } from './evaluator';
export { runBenchmark } from './benchmark-runner';

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