export { ClaudeAgent } from "./agents/feature-addition/claude-agent.ts";
export { createShellAgent, defaultShellAgent } from "./agents/shell-agent.ts";
export type {
  CodingAgent,
  FeatureAgentError,
} from "./agents/types.ts";
export {
  outputBenchmarkResults,
  readBenchmarkPrompts,
  runBenchmarkWithExistingCode,
  runBenchmarkWithNewCode,
} from "./benchmark-lib.ts";
export type {
  EvaluationConfig,
  EvaluationMetadata,
} from "./evaluator/config.ts";
export { EvaluationError } from "./evaluator/errors.ts";
export { evaluate as eval, evaluateUpdates } from "./evaluator/evaluator.ts";
export type {
  CompleteInstanceResult,
  EvaluationResult,
  InstanceResult,
} from "./evaluator/result.ts";
