/**
 * Test runner error types using Effect's Data.TaggedError
 */

import { Data } from "effect";
import type { DriverAgentError } from "./agents/driver-agent.ts";

/*************************************
    Dev Server Errors
***************************************/

export type DevServerError =
  | DevServerPortInUseError
  | DevServerProjectNotFoundError
  | DevServerDependenciesNotInstalledError
  | DevServerStartupTimeoutError;

export class DevServerPortInUseError extends Data.TaggedError(
  "DevServerPortInUseError",
)<{
  readonly port: number;
  readonly nextAvailablePort: number;
}> {}

export class DevServerProjectNotFoundError extends Data.TaggedError(
  "DevServerProjectNotFoundError",
)<{
  readonly folderPath: string;
}> {}

export class DevServerDependenciesNotInstalledError extends Data.TaggedError(
  "DevServerDependenciesNotInstalledError",
)<{
  readonly folderPath: string;
}> {}

export class DevServerStartupTimeoutError extends Data.TaggedError(
  "DevServerStartupTimeoutError",
)<{
  readonly url: string;
  readonly timeoutMs: number;
}> {}

/*************************************
    Test Runner Error Union
***************************************/

/**
 * Union of all errors that can occur during test runner execution.
 * Includes both dev server infrastructure errors and driver agent errors.
 */
export type TestRunnerError = DriverAgentError | DevServerError;
