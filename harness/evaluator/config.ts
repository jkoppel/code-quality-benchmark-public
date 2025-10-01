// import { Config, Effect, Schema } from "effect";

export interface EvaluationConfig {
  instancesPerFeatureAgent: number;

  // TODO: Add a LoggerConfig back in later

  // TODO: Think more about how to expose configuration for the options and prompts for the agents
  // claudeConfig?: ClaudeAgentConfig;

  // Other things that are currently not used
  // timeout?: number;
}

// TODO: Use Effect's facilities for specifying defaults
export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  instancesPerFeatureAgent: 3,
};

export interface EvaluationMetadata {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  config: EvaluationConfig;
}
