import { Command } from "@effect/platform";

/**
 * Helper for creating git commands with a working directory
 */
export const gitCmd = (workingDir: string, ...args: string[]) =>
  Command.make("git", ...args).pipe(
    Command.workingDirectory(workingDir),
    Command.string,
  );
