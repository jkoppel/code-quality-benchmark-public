import { EvaluationConfig } from '../types';

export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  timeout: 300000, // 5 minutes
  logLevel: 'info',
  claudeConfig: {
    systemPrompt: undefined, // Will use default from ClaudeAgent
    allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'LS', 'Glob'],
    temperature: 0.7,
    maxTokens: 4096
  }
};
