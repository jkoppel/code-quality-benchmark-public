import type { EvaluationConfig } from "../evaluator/types.ts";

export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  timeout: 300000, // 5 minutes
  logLevel: "info",
  claudeConfig: {
    appendSystemPrompt: undefined, // Will use default from ClaudeAgent
    allowedTools: ["Read", "Write", "Edit", "Bash", "LS", "Glob"],
  },
};
