export type CodingAgent = (prompt: string, folderPath: string) => Promise<void>;

export interface EvaluationConfig {
  workspaceRoot?: string;
  timeout?: number;
  cleanupAfterRun?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  claudeConfig?: ClaudeAgentConfig;
}

export interface ClaudeAgentConfig {
  systemPrompt?: string;
  allowedTools?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface EvaluationResult {
  initialPrompt: string;
  updatePrompt: string;
  originalProgramPath: string;
  updates: InstanceResult[];
  metadata: EvaluationMetadata;
}

export interface InstanceResult {
  instanceId: string;
  folderPath: string;
  success: boolean;
  error?: Error;
  executionTime: number;
}

export interface EvaluationMetadata {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  agentUsed: string;
  config: EvaluationConfig;
}

export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'EvaluationError';
  }
}

export class AgentExecutionError extends EvaluationError {
  constructor(message: string, details?: unknown) {
    super(message, 'AGENT_EXECUTION_ERROR', details);
    this.name = 'AgentExecutionError';
  }
}

