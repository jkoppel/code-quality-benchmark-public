export { ClaudeAgent } from "./agents/feature-addition/claude-agent.js";
export { createShellAgent, defaultShellAgent } from "./agents/shell-agent.js";
export {
  outputBenchmarkResults,
  readBenchmarkPrompts,
  runBenchmarkWithExistingCode,
  runBenchmarkWithNewCode,
} from "./benchmark-lib.js";
export { evaluate as eval, evaluateUpdates } from "./evaluator.js";
export {
  AgentExecutionError,
  ClaudeAgentConfig,
  CodingAgent,
  EvaluationConfig,
  EvaluationError,
  EvaluationMetadata,
  EvaluationResult,
  InstanceResult,
} from "./types.js";
export { LogEntry, Logger, LogLevel } from "./utils/logger/logger.js";
