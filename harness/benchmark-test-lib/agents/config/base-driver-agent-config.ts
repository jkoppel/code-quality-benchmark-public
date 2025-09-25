import type { PermissionMode } from "@anthropic-ai/claude-code";

/***************************************************
    Base Driver Agent config / options
  for Test Case Agent and Discovery Agent
****************************************************/

/** Base Driver Agent config. Currently specialized to Claude Code. */
export const BASE_CONFIG = {
  permissionMode: "bypassPermissions" as const satisfies PermissionMode, // NOTE THIS
  maxTurns: 180, // TODO: Tune this
  executable: "node" as const,
};
