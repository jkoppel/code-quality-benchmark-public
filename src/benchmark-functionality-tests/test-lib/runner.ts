import unimplemented from "ts-unimplemented";
import type { TestSuiteResults } from "./report";
import type { TestCaseAgent } from "./test-case-agent";

export interface TestRunnerConfig {
  agent: TestCaseAgent;
  timeoutMs: number;
}

export class TestRunner {
  constructor(private config: TestRunnerConfig) {}

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

  private async withSutDevServer<T>(
    startServer: () => Promise<{ server: T; stop: () => Promise<void> }>,
    runTests: (server: T) => Promise<void>,
  ): Promise<void> {
    return this.withResource(async (): Promise<Resource<T>> => {
      const { server, stop } = await startServer();
      return { resource: server, cleanup: stop };
    }, runTests);
  }

  async runTestSuite(): Promise<TestSuiteResults> {
    const partialResults: TestSuiteResults = {
      name: "TODO",
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
      groups: [],
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
