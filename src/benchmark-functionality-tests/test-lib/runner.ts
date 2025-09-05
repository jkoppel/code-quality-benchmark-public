import { match } from "ts-pattern";
import { execa, type ExecaChildProcess, type ExecaError } from "execa";
import { Logger } from "../../utils/logger.js";
import type { TestSuiteResults } from "./report.js";
import type { Suite } from "./suite.js";
import {
	NonVisionTestCaseAgent,
	VisionTestCaseAgent,
} from "./test-case-agent.js";

/** Config for the system under test */
export interface SutConfig {
	folderPath: string;
  /** Port at which we will try to start the dev server of the app under test */
	port: number;
}

export interface TestRunnerConfig {
	sutConfig: SutConfig;
	// timeoutMs: number;
}

export class TestRunner {
	constructor(
		private readonly config: TestRunnerConfig,
		private readonly logger: Logger = Logger.getInstance(),
	) {}

	async runTestSuite(suite: Suite): Promise<TestSuiteResults> {
		const startTime = Date.now();

		// await this.withSutDevServer(
		//   async () => {
		//     // TODO: Start dev server based on config
		//     // const serverProcess = execa('npm', ['run', 'start'], { cwd: sutProjectPath })
		//     // await waitForServerReady('http://localhost:3000')
		//     throw new Error("Dev server startup not implemented yet");
		//   },
		//   async (server) => {
		//     // TODO: Run function
		//   /** Port that we will try to start the dev server of the app under testality tests against the server
		//     // await runFunctionalityTests(server.url)
		//     throw new Error("Test execution not implemented yet");
		//   },
		// );
		const results = await Promise.all(
			suite.getTests().map(async (test) => {
				return match(test)
					.with({ type: "vision" }, (visionTest) =>
						visionTest.run(new VisionTestCaseAgent(this.config.sutConfig, this.logger))
					)
					.with({ type: "non-vision" }, (nonVisionTest) =>
						nonVisionTest.run(new NonVisionTestCaseAgent(this.config.sutConfig, this.logger))
					)
					.exhaustive();
			}),
		);

		const duration = Date.now() - startTime;
		const passed = results.filter((r) => r.outcome.status === "passed").length;
		const failed = results.filter((r) => r.outcome.status === "failed").length;
		const skipped = results.filter(
			(r) => r.outcome.status === "skipped",
		).length;

		return {
			name: suite.getName(),
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
	}

	// Helpers
	private async withSutDevServer(
		runTests: (server: DevServerInfo) => Promise<void>,
	): Promise<void> {
		return this.withResource(async (): Promise<Resource<DevServerInfo>> => {
			return await startDevServer(this.config.sutConfig, this.logger);
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

interface DevServerInfo {
	port: number;
	process: ExecaChildProcess;
}

async function startDevServer(
	sutConfig: SutConfig,
	logger: Logger,
): Promise<Resource<DevServerInfo>> {
	// Assumption: Every app under test can be started with PORT=${...} npm run start
	logger.info(`Starting dev server at ${sutConfig.folderPath} on port ${sutConfig.port}`);
	
	const controller = new AbortController();
	
	const subprocess = execa('npm', ['run', 'start'], {
		cwd: sutConfig.folderPath,
		env: { ...process.env, PORT: sutConfig.port.toString() },
		stdout: 'pipe',
		stderr: 'pipe',
		cleanup: true,
		cancelSignal: controller.signal,
	});

	// Process stdout lines in real-time
	(async () => {
		try {
			if (subprocess.stdout) {
				for await (const line of subprocess.stdout) {
					if (line.trim()) {
						logger.info(`[DEV-SERVER] ${line}`);
					}
				}
			}
		} catch {
			// Stream closed or process terminated, expected behavior
		}
	})();

	// Process stderr lines in real-time
	(async () => {
		try {
			if (subprocess.stderr) {
				for await (const line of subprocess.stderr) {
					if (line.trim()) {
						logger.error(`[DEV-SERVER-ERROR] ${line}`);
					}
				}
			}
		} catch {
			// Stream closed or process terminated, expected behavior
		}
	})();

	const serverInfo: DevServerInfo = {
		port: sutConfig.port,
		process: subprocess,
	};

	const cleanup = async () => {
		logger.info('Stopping dev server...');
		
		try {
			controller.abort();
			await subprocess;
		} catch (error: unknown) {
			const execaError = error as ExecaError;
			if (execaError.isCanceled) {
				logger.info('Dev server cancelled successfully');
			} else if (execaError.signal === 'SIGTERM' || execaError.signal === 'SIGKILL') {
				logger.info(`Dev server terminated with signal ${execaError.signal}`);
			} else if (execaError.exitCode) {
				logger.warn(`Dev server exited with code ${execaError.exitCode}`);
			} else {
				logger.error('Error stopping dev server:', error);
			}
		}
	};

	// Wait for the server to be ready
	const serverUrl = `http://localhost:${sutConfig.port}`;
	try {
		logger.info(`Waiting for server to be ready at ${serverUrl}...`);
		
		// Race between server readiness and process failure
		await Promise.race([
			waitForServerReady(serverUrl),
			subprocess.catch((error: unknown) => {
				const execaError = error as ExecaError;
				throw new Error(`Dev server process failed during startup: ${execaError.shortMessage || execaError.message}`);
			})
		]);
		
		logger.info('Dev server is ready');
	} catch (error) {
		// Cleanup on failure
		await cleanup();
		throw new Error(`Failed to start dev server: ${error}`);
	}

	return { resource: serverInfo, cleanup };
}

async function waitForServerReady(
	url: string,
	timeoutMs = 30000,
): Promise<void> {
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
