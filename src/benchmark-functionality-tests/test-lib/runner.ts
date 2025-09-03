import unimplemented from "ts-unimplemented";
import { Logger } from "../../utils/logger.js";
import type { DriverAgent } from "./driver-agent.js";
import type { TestSuiteResults } from "./report.js";
import type { Suite } from "./suite.js";

/** Config for the system under test */
export interface SutConfig {
  folderPath: string;
  port: number;
}

export interface TestRunnerConfig {
  sutConfig: SutConfig;
  // timeoutMs: number;
}

export class TestRunner {
  constructor(
    private readonly config: TestRunnerConfig,
    private readonly driver: DriverAgent,
    private readonly logger: Logger = Logger.getInstance(),
  ) {}

  async runTestSuite(tests: Suite): Promise<TestSuiteResults> {
    const partialResults: Pick<TestSuiteResults, "name" | "timestamp"> = {
      name: "TODO",
      timestamp: new Date().toISOString(),
    };

    await this.withSutDevServer(
      async () => {
        // TODO: Start dev server based on config
        // const serverProcess = execa('npm', ['run', 'start'], { cwd: sutProjectPath })
        // await waitForServerReady('http://localhost:3000')
        throw new Error("Dev server startup not implemented yet");
      },
      async (server) => {
        // TODO: Run functionality tests against the server
        // await runFunctionalityTests(server.url)
        throw new Error("Test execution not implemented yet");
      },
    );

    return unimplemented();
  }

  // Helpers
  private async withSutDevServer<T>(
    startServer: () => Promise<{ server: T; stop: () => Promise<void> }>,
    runTests: (server: T) => Promise<void>,
  ): Promise<void> {
    return this.withResource(async (): Promise<Resource<T>> => {
      const { server, stop } = await startServer();
      return { resource: server, cleanup: stop };
    }, runTests);
  }

  private async withResource<T>(
    acquire: () => Promise<Resource<T>>,
    use: (resource: T) => Promise<void>,
  ): Promise<void> {
    const { resource, cleanup } = await acquire();
    try {
      await use(resource);
    } finally {
      await cleanup();
    }
  }
}

/***********************
   Helpers
************************/

// TODO: Prob extract the following to top-level utils

export interface Resource<T> {
  resource: T;
  cleanup: () => Promise<void>;
}

async function waitForServerReady(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready yet, continue polling
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}
