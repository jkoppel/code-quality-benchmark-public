import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Effect } from "effect";
import {
  makeSuccessInstanceResult,
  type SuccessInstanceResult,
} from "../../evaluator/result.ts";
import { getLoggerConfig, type Logger } from "../../utils/logger/logger.ts";
import { createShellAgent } from "../shell-agent.ts";
import { type FeatureAgent, FeatureAgentError } from "../types.ts";
import { getFullPrompt, SYSTEM_PROMPT } from "./common-prompts.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codexScriptPath = path.join(__dirname, "../../../agents/raw_codex.sh");

const baseCodexAgent = createShellAgent(codexScriptPath);

export class CodexAgent implements FeatureAgent {
  private readonly name = "codex";
  private readonly logger: Logger;

  constructor(logger: Logger = getLoggerConfig().logger) {
    this.logger = logger;
  }

  getName(): string {
    return this.name;
  }

  applyUpdate(
    updatePrompt: string,
    folderPath: string,
    instanceId: string,
    port: number,
  ): Effect.Effect<SuccessInstanceResult, FeatureAgentError, never> {
    const startTime = Date.now();

    this.logger
      .withMetadata({
        folderPath,
        updatePrompt: updatePrompt.substring(0, 100),
      })
      .info(`Starting Codex agent for instance ${instanceId}`);

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${getFullPrompt(updatePrompt, folderPath, port)}`;

    return Effect.tryPromise({
      try: () => baseCodexAgent(fullPrompt, folderPath, port),
      catch: (error) => error,
    }).pipe(
      Effect.matchEffect({
        onFailure: (error) =>
          Effect.gen(function* () {
            const errorMessage =
              error instanceof Error ? error.message : String(error);

            yield* Effect.logError(
              `Failed to apply update for instance ${instanceId}`,
              error,
            );

            return yield* Effect.fail(
              new FeatureAgentError({
                message: `Codex agent failed for instance ${instanceId}: ${errorMessage}`,
                cause: error,
              }),
            );
          }),
        onSuccess: () =>
          Effect.succeed(
            makeSuccessInstanceResult(
              instanceId,
              folderPath,
              "codex",
              Date.now() - startTime,
            ),
          ),
      }),
    );
  }
}
