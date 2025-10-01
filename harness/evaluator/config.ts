// import { Config, Effect, Schema } from "effect";

export interface EvaluationConfig {
  workspaceRoot?: string; // TODO: Use this instead of workspaceDir?
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error"; // TODO: Do we really need this?
  instancesPerFeatureAgent: number;
  // TODO: Think more about how to expose configuration for the options and prompts for the agents
  // claudeConfig?: ClaudeAgentConfig;
}

export interface EvaluationMetadata {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  config: EvaluationConfig;
}
