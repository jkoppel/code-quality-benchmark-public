export { ClaudeAgent } from "./agents/feature-addition/claude-agent.ts";
export { createShellAgent, defaultShellAgent } from "./agents/shell-agent.ts";
export {
  outputBenchmarkResults,
  readBenchmarkPrompts,
  runBenchmarkWithExistingCode,
  runBenchmarkWithNewCode,
} from "./benchmark-lib.ts";
export { evaluate as eval, evaluateUpdates } from "./evaluator.ts";
export type {
  AgentExecutionError,
  ClaudeAgentConfig,
  CodingAgent,
  EvaluationConfig,
  EvaluationError,
  EvaluationMetadata,
  EvaluationResult,
  InstanceResult,
} from "./types.ts";
export type { Logger, LogLevel } from "./utils/logger/logger.ts";
