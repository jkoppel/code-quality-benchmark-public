/**
 * Test runner for functional tests
 *
 * Some of the code here is adapted from Playwright
 * - waitForServerReady() function
 * - Process shutdown pattern in startDevServer()
 *
 * The adapted-from-Playwright portions (and only those) are
 * copyright (c) Microsoft Corporation
 * Licensed under the Apache License, Version 2.0
 * Source: https://github.com/microsoft/playwright
 */

import path from "node:path";
import detect from "detect-port";
import { Effect, Runtime } from "effect";
import fs from "fs-extra";
import { LoggerConfig } from "../utils/logger/logger.ts";
import { jsonStringify } from "../utils/logger/pretty.ts";
import { launchProcess } from "../utils/process-launcher.ts";
import { DiscoveryAgent } from "./agents/discovery-agent.ts";
import type { DriverAgentError } from "./agents/driver-agent.ts";
import {
  TestCaseAgent,
  type TestCaseAgentOptions,
} from "./agents/test-case-agent.ts";
import type { TestContext } from "./context.ts";
import {
  DevServerDependenciesNotInstalledError,
  type DevServerError,
  DevServerPortInUseError,
  DevServerProjectNotFoundError,
  DevServerStartupTimeoutError,
  type TestRunnerError,
} from "./errors.ts";
import type { TestSuiteResult } from "./report.ts";
import type { Suite, SuiteGenerationStrategy } from "./suite.ts";

/** Config for the system under test */
export interface SutConfig {
  folderPath: string;
  /** Port at which we will try to start the dev server of the app under test */
  port: number;
}

export class TestRunnerConfig {
  static make(
    sutConfig: SutConfig,
    maxConcurrentTests: number,
    browserIsHeaded: boolean,
    playwrightOutDir?: string,
  ) {
    // Need to error in order for the benchmark args parser to error if the config options not valid
    if (!(sutConfig.port >= 1 && sutConfig.port <= 65535))
      throw new Error(`Invalid port: ${sutConfig.port}`);

    if (maxConcurrentTests < 1)
      throw new Error(`max-concurrent-tests must be >= 1`);

    return new TestRunnerConfig(
      sutConfig,
      maxConcurrentTests,
      browserIsHeaded,
      playwrightOutDir && path.resolve(playwrightOutDir),
    );
  }

  private constructor(
    private readonly sutConfig: SutConfig,
    private readonly maxConcurrentTests: number,
    /** Have playwright run browser in headed (show browser window) vs. headless mode */
    private readonly browserIsHeaded: boolean,
    /** Abs path to directory for Playwright MCP output files (traces, sessions) */
    private readonly playwrightOutDir?: string,
  ) {}

  getMaxConcurrentTests(): number {
    return this.maxConcurrentTests;
  }

  getSutConfig(): SutConfig {
    return this.sutConfig;
  }

  getSutFolderPath(): string {
    return this.sutConfig.folderPath;
  }

  getPlaywrightBrowserModeFlag(): string {
    return this.browserIsHeaded ? "--headed" : "--headless";
  }

  /** Abs path to directory for Playwright MCP output files */
  getPlaywrightOutDir(): string | undefined {
    return this.playwrightOutDir;
  }

  toPretty(): string {
    const simplifiedConfig = {
      folderPath: this.getSutConfig().folderPath,
      port: this.getSutConfig().port,
      browserIsHeaded: this.browserIsHeaded,
      maxConcurrentTests: this.maxConcurrentTests,
      playwrightOutDir: this.playwrightOutDir,
    };
    return jsonStringify(simplifiedConfig);
  }
}

export class TestRunner {
  constructor(private readonly config: TestRunnerConfig) {}

  getConfig(): TestRunnerConfig {
    return this.config;
  }

  executeStrategy(
    strategy: SuiteGenerationStrategy,
  ): Effect.Effect<TestSuiteResult, TestRunnerError, LoggerConfig> {
    const self = this;
    return Effect.gen(function* () {
      // Capture runtime to access LoggerConfig context from within the event handler callback.
      // The handler runs outside Effect.gen where we can't yield* dependencies,
      // so we capture the runtime (which contains Context<LoggerConfig>) and use
      // runtime.runFork() to execute the logger Effect with that context.
      // See: https://effect.website/docs/runtime/
      const { logger } = yield* LoggerConfig;
      const runtime = yield* Effect.runtime();

      const maxListenersExceededWarningHandler = (warning: Error) => {
        if (warning.name === "MaxListenersExceededWarning") {
          Runtime.runFork(runtime)(
            logger.error(
              `MaxListenersExceededWarning detected: ${warning.message}`,
              { stack: warning.stack },
            ),
          );
          // throw new Error(dedent`
          //   Test generation/execution aborted due to MaxListenersExceededWarning.
          //   Am because this *may*, in my experience, indicate resource leaks (or other issues) that could affect testing.
          //   I'm not at all sure about this -- just feels like it's safer to error loudly for the time being.`);
        }
      };

      process.on("warning", maxListenersExceededWarningHandler);

      // TODO: Clean up the stuff below at some point

      try {
        const server = yield* startDevServer(self.config.getSutConfig());

        try {
          const context = yield* strategy.discover(
            self.config,
            DiscoveryAgent.make(self.getConfig()),
          );
          const suite = yield* strategy.generateSuite(
            self.getConfig(),
            context,
          );
          return yield* self.runTestSuite_(context, suite);
        } finally {
          yield* Effect.promise(() => server[Symbol.asyncDispose]());
        }
      } finally {
        process.off("warning", maxListenersExceededWarningHandler);
      }
    });
  }

  /** Run a test suite without starting dev server */
  private runTestSuite_(
    context: TestContext,
    suite: Suite,
  ): Effect.Effect<TestSuiteResult, DriverAgentError, LoggerConfig> {
    const self = this;
    return Effect.gen(function* () {
      const startTime = Date.now();

      // Run tests
      const testEffects = suite.getTests().map((test) => {
        const makeAgent = (options: TestCaseAgentOptions) =>
          TestCaseAgent.make(options, self.getConfig());
        return Effect.gen(function* () {
          const result = yield* test.run(makeAgent, context, self.config);
          result.name = test.descriptiveName;
          return result;
        });
      });

      const results = yield* Effect.all(testEffects, {
        concurrency: self.getConfig().getMaxConcurrentTests(),
      });

      const duration = Date.now() - startTime;
      const passed = results.filter(
        (r) => r.outcome.status === "passed",
      ).length;
      const failed = results.filter(
        (r) => r.outcome.status === "failed",
      ).length;
      const skipped = results.filter(
        (r) => r.outcome.status === "skipped",
      ).length;

      return {
        name: suite.getName(),
        sutFolderPath: self.config.getSutConfig().folderPath,
        timestamp: new Date(startTime).toISOString(),
        summary: {
          total: results.length,
          passed,
          failed,
          skipped,
          duration,
        },
        results,
      };
    });
  }

  runTestSuite(
    context: TestContext,
    suite: Suite,
  ): Effect.Effect<TestSuiteResult, TestRunnerError, LoggerConfig> {
    const self = this;
    return Effect.gen(function* () {
      const server = yield* startDevServer(self.config.getSutConfig());

      try {
        return yield* self.runTestSuite_(context, suite);
      } finally {
        yield* Effect.promise(() => server[Symbol.asyncDispose]());
      }
    });
  }
}

/***********************
   Helpers
************************/

interface DevServerHandle {
  [Symbol.asyncDispose](): Promise<void>;
}

const DEFAULT_ENVIRONMENT_VARIABLES = {
  BROWSER: "none", // Prevent create-react-app from opening browser
  FORCE_COLOR: "1",
  DEBUG_COLORS: "1",
};

function startDevServer(
  sutConfig: SutConfig,
): Effect.Effect<DevServerHandle, DevServerError, LoggerConfig> {
  return Effect.gen(function* () {
    const { logger } = yield* LoggerConfig;
    const runtime = yield* Effect.runtime();

    yield* logger.debug("Pre-validation checks before starting dev server...");

    // Check port availability first
    const availablePort = yield* Effect.promise(() => detect(sutConfig.port));
    if (availablePort !== sutConfig.port) {
      return yield* Effect.fail(
        new DevServerPortInUseError({
          port: sutConfig.port,
          nextAvailablePort: availablePort,
        }),
      );
    }

    const serverUrl = `http://localhost:${sutConfig.port.toString()}`;

    // Check for package.json before attempting to run npm
    const packageJsonPath = path.join(sutConfig.folderPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return yield* Effect.fail(
        new DevServerProjectNotFoundError({
          folderPath: sutConfig.folderPath,
        }),
      );
    }
    // Check for node_modules to ensure dependencies are installed
    const nodeModulesPath = path.join(sutConfig.folderPath, "node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      return yield* Effect.fail(
        new DevServerDependenciesNotInstalledError({
          folderPath: sutConfig.folderPath,
        }),
      );
    }

    yield* logger.info(
      `Starting dev server at ${sutConfig.folderPath} on port ${sutConfig.port.toString()}`,
    );

    // Using process launcher adapted from Playwright,
    // because a naive, vibe-coded approach had issues with stopping the dev server
    const { launchedProcess, gracefullyClose } = yield* Effect.promise(() =>
      launchProcess({
        // Crucial assumption: all the apps under test have a `npm run start` script
        // We pass both PORT env var and --port CLI args to support different dev server types:
        // - CRA apps (react-scripts) respect the PORT environment variable
        // - Vite apps ignore PORT env var but accept --port CLI argument
        // This approach works for both since each ignores what it doesn't need
        command: "npm",
        args: [
          "run",
          "start",
          "--",
          "--port",
          sutConfig.port.toString(),
          "--no-open",
        ],
        env: {
          ...DEFAULT_ENVIRONMENT_VARIABLES,
          ...process.env,
          PORT: sutConfig.port.toString(),
        },
        shell: false,
        handleSIGINT: true,
        handleSIGTERM: true,
        handleSIGHUP: true,
        stdio: "pipe",
        tempDirectories: [],
        cwd: sutConfig.folderPath,
        // biome-ignore lint/suspicious/useAwait: Returns Promise from new Promise constructor
        attemptToGracefullyClose: async () => {
          // Send SIGTERM to process group (-pid) to kill npm + webpack + all child processes
          if (process.platform === "win32") {
            throw new Error("Use default force kill on Windows");
          }

          if (launchedProcess.pid) {
            process.kill(-launchedProcess.pid, "SIGTERM");
          } else {
            throw new Error("Process PID not available for graceful shutdown");
          }

          // Wait up to 5 seconds for graceful shutdown
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Graceful shutdown timed out"));
            }, 5000);

            launchedProcess.once("close", () => {
              clearTimeout(timeout);
              resolve();
            });
          });
        },
        onExit: (exitCode, signal) => {
          if (exitCode && exitCode !== 0) {
            Runtime.runFork(runtime)(
              logger.warn(
                `Dev server exited with code ${exitCode.toString()}, signal ${signal || "none"}`,
              ),
            );
          } else {
            Runtime.runFork(runtime)(logger.info("Dev server exited cleanly"));
          }
        },
        log: (message) => {
          // Parse and format dev server output
          if (message.includes("[out]")) {
            Runtime.runFork(runtime)(
              logger.info(
                message.replace(/\[pid=\d+\]\[out\]/, "[DEV-SERVER]"),
              ),
            );
          } else if (message.includes("[err]")) {
            Runtime.runFork(runtime)(
              logger.error(
                message.replace(/\[pid=\d+\]\[err\]/, "[DEV-SERVER-ERROR]"),
              ),
            );
          } else {
            Runtime.runFork(runtime)(logger.debug(message));
          }
        },
      }),
    );

    // Wait for server to be ready
    yield* logger.info(`Waiting for server to be ready at ${serverUrl}...`);
    yield* Effect.promise(() => waitForServerReady(serverUrl));
    yield* logger.info("Dev server is ready");

    return {
      async [Symbol.asyncDispose]() {
        await Runtime.runPromise(runtime)(
          logger.info("Stopping dev server..."),
        );
        await gracefullyClose();
        await Runtime.runPromise(runtime)(logger.info("Dev server stopped"));
      },
    };
  });
}

/** Adapted from https://github.com/microsoft/playwright/blob/f8f3e07efb4ea56bf77e90cf90bd6af754a6d2c3/packages/playwright/src/plugins/webServerPlugin.ts */
async function waitForServerReady(
  url: string,
  timeoutMs = 30000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const delays = [100, 250, 500];
  // c.f. Playwright:  https://github.com/microsoft/playwright/blob/f8f3e07efb4ea56bf77e90cf90bd6af754a6d2c3/packages/playwright/src/plugins/webServerPlugin.ts#L186

  // TODO: not sure about this way of checking for readiness
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      // Try main URL first
      let response = await fetch(url);
      if (response.ok) return;

      // Fallback to /index.html for SPAs (common pattern)
      if (response.status === 404 && new URL(url).pathname === "/") {
        response = await fetch(`${url}index.html`);
        if (response.ok) return;
      }
    } catch (error) {
      // Server not ready yet, continue polling
      lastError = error;
    }

    const delay = delays.shift() || 1000; // Progressive backoff, cap at 1s
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new DevServerStartupTimeoutError({
    url,
    timeoutMs,
    cause: lastError,
  });
}
