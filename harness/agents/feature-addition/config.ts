import type { CodingAgent } from "../types.ts";
import type { ClaudeAgent } from "./claude-agent";

/** Config for feature addition agents */
export interface AgentConfig {
  name: string;
  // TODO: Will refactor this later when we standardize CodingAgent to include ClaudeAgent
  agent: CodingAgent | ClaudeAgent;
}
