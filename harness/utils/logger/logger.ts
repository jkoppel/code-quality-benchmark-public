import path from "node:path";
import { FileSystem, PlatformLogger } from "@effect/platform";
import { SystemError } from "@effect/platform/Error";
import { NodeFileSystem } from "@effect/platform-node";
import {
  Config,
  ConfigError,
  Context,
  Effect,
  HashMap,
  Layer,
  Logger,
  LogLevel,
  Option,
} from "effect";
import { match } from "ts-pattern";
import { claudeCodeSerializer } from "../claude-code-sdk/serializer.ts";
import { isSDKMessage } from "../claude-code-sdk/type-guards.ts";

// ================================================
//   TODO: Need to review this file more carefully
// ================================================

const LOG_DIR = "./logs";
const LOG_FILE = path.join(LOG_DIR, "benchmark.log");

/*************************************************
    Configuration
**************************************************/

/**
 * Parses log level string into Effect LogLevel.
 * Supports: trace, debug, info, warn, warning, error (case-insensitive)
 */
const parseLogLevel = (
  raw: string,
): Effect.Effect<LogLevel.LogLevel, ConfigError.ConfigError> => {
  const normalized = raw.trim().toLowerCase();
  return match(normalized)
    .with("trace", () => Effect.succeed(LogLevel.Trace))
    .with("debug", () => Effect.succeed(LogLevel.Debug))
    .with("info", () => Effect.succeed(LogLevel.Info))
    .with("warn", "warning", () => Effect.succeed(LogLevel.Warning))
    .with("error", () => Effect.succeed(LogLevel.Error))
    .otherwise(() =>
      Effect.fail(
        ConfigError.InvalidData(
          [],
          `Invalid log level: ${raw}. Valid values are: trace, debug, info, warn, warning, error`,
        ),
      ),
    );
};

/**
 * Defines config for log level.
 * Reads LOG_LEVEL from whichever ConfigProvider is active in scope, defaulting to "info".
 */
const logLevelConfig = Config.string("LOG_LEVEL").pipe(
  Config.withDefault("info"),
  Config.map((s) => s.trim()),
);

/*************************************************
    Serialization
**************************************************/

/**
 * Processes annotations before logging.
 * Applies custom serializer for 'claudeCode' annotation.
 * Redaction of sensitive fields happens during serialization.
 */
function processAnnotations(
  annotations: HashMap.HashMap<string, unknown>,
): HashMap.HashMap<string, unknown> {
  const maybeClaudeCode = HashMap.get(annotations, "claudeCode");

  if (Option.isSome(maybeClaudeCode) && isSDKMessage(maybeClaudeCode.value)) {
    return HashMap.set(
      annotations,
      "claudeCode",
      claudeCodeSerializer(maybeClaudeCode.value),
    );
  }

  return annotations;
}

/*************************************************
    Dual Logger Layer (Console + File)
**************************************************/

/**
 * Logger layer that logs to both console and file with serialization & redaction.
 *
 * Features:
 * - Console: respects LOG_LEVEL env var, uses pretty format
 * - File: logs everything in logfmt format with batching
 * - Serialization: applies claudeCodeSerializer to 'claudeCode' annotations
 * - Redaction: removes sensitive fields (api_key, password, token)
 *
 * Effect's logging system has two levels of filtering:
 * 1. Global minimum log level (FiberRef): filters before loggers see messages
 * 2. Per-logger filtering: applied by individual loggers
 *
 * We set global minimum to All so file logger receives all messages,
 * then use filterLogLevel on console logger for env-based filtering.
 *
 * Based on Effect docs:
 * - PlatformLogger.toFile: https://effect.website/docs/platform/platformlogger/
 * - Logger.zip: https://effect.website/docs/observability/logging/
 * - Logger.replaceScoped: https://effect.website/docs/observability/logging/
 * - Logger.minimumLogLevel: https://effect.website/docs/observability/logging/#minimum-log-level
 *
 * Usage:
 * ```typescript
 * program.pipe(Effect.provide(dualLoggerLayer))
 * ```
 */
export const dualLoggerLayer = Layer.unwrapScoped(
  Effect.gen(function* () {
    const rawLogLevel = yield* logLevelConfig;
    const envLogLevel = yield* parseLogLevel(rawLogLevel);

    // Ensure log directory exists
    const fs = yield* FileSystem.FileSystem;
    yield* fs.makeDirectory(LOG_DIR, { recursive: true }).pipe(
      Effect.catchIf(
        (error): error is SystemError =>
          error instanceof SystemError && error.reason === "AlreadyExists",
        () => Effect.void,
      ),
    );

    // Console logger: start from pretty logger, then filter & add serialization
    const consoleLogger = Logger.prettyLoggerDefault.pipe(
      Logger.mapInputOptions((options) => ({
        ...options,
        annotations: processAnnotations(options.annotations),
      })),
      Logger.filterLogLevel((level) =>
        LogLevel.greaterThanEqual(level, envLogLevel),
      ),
      Logger.map((maybe) =>
        Option.match(maybe, {
          onNone: () => undefined,
          onSome: (value) => value,
        }),
      ),
    );

    // File logger: logfmt serializer with annotation processing + batching
    const fileLogger = yield* Logger.logfmtLogger.pipe(
      Logger.mapInputOptions((options) => ({
        ...options,
        annotations: processAnnotations(options.annotations),
      })),
      PlatformLogger.toFile(LOG_FILE, {
        batchWindow: "2 seconds", // Batch writes for performance
      }),
    );

    return Layer.mergeAll(
      Logger.replaceScoped(
        Logger.prettyLoggerDefault,
        Effect.succeed(consoleLogger),
      ),
      Logger.addScoped(Effect.succeed(fileLogger)),
    );
  }),
).pipe(
  Layer.provide(NodeFileSystem.layer),
  // Set global minimum to All so DEBUG/TRACE logs reach our loggers
  // Individual loggers (console) apply their own filtering via filterLogLevel
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
);

/*************************************************
    HarnessLogger API
**************************************************/

type LogFields = Record<string, unknown>;

/**
 * HarnessLogger provides a fluent API for logging with structured fields.
 *
 * Benefits over Effect.annotateLogs pipe pattern:
 * 1. Inline fields are cleaner: `logger.info("msg", { field: val })` vs `Effect.logInfo("msg").pipe(Effect.annotateLogs(...))`
 * 2. No `Effect.sync` wrapper needed for synchronous operations
 * 3. Child logger accumulates context across multiple calls
 *
 * Field merging: call-site fields override child logger fields override parent logger fields.
 */
export interface HarnessLogger {
  trace(message: string, fields?: LogFields): Effect.Effect<void>;
  debug(message: string, fields?: LogFields): Effect.Effect<void>;
  info(message: string, fields?: LogFields): Effect.Effect<void>;
  warn(message: string, fields?: LogFields): Effect.Effect<void>;
  error(message: string, fields?: LogFields): Effect.Effect<void>;
  child(fields: LogFields): HarnessLogger;
}

// TODO: What's with this baseFields stuff?
/**
 * Creates a HarnessLogger instance with accumulated base fields.
 * Uses Effect's FiberRef-based annotation system for automatic propagation.
 */
const makeHarnessLogger = (baseFields: LogFields): HarnessLogger => {
  const logWithLevel =
    (
      logFn: (message: string) => Effect.Effect<void>,
    ): ((message: string, fields?: LogFields) => Effect.Effect<void>) =>
    (message: string, fields: LogFields = {}) => {
      // Merge base context with call-site fields (call-site wins on conflicts)
      const mergedFields = { ...baseFields, ...fields };
      return logFn(message).pipe(Effect.annotateLogs(mergedFields));
    };

  return {
    trace: logWithLevel((msg) => Effect.logTrace(msg)),
    debug: logWithLevel((msg) => Effect.logDebug(msg)),
    info: logWithLevel((msg) => Effect.logInfo(msg)),
    warn: logWithLevel((msg) => Effect.logWarning(msg)),
    error: logWithLevel((msg) => Effect.logError(msg)),
    // Child logger accumulates fields by merging with base
    child: (fields) => makeHarnessLogger({ ...baseFields, ...fields }),
  };
};

/*************************************************
    LoggerConfig Service
**************************************************/

/**
 * LoggerConfig provides the configured log level and logger instance
 * through Effect's dependency injection system.
 */
export class LoggerConfig extends Context.Tag("LoggerConfig")<
  LoggerConfig,
  {
    readonly logLevel: LogLevel.LogLevel;
    readonly logger: HarnessLogger;
  }
>() {}

/*************************************************
    LoggerConfig Layer
**************************************************/

/**
 * Layer that provides LoggerConfig through context.
 * Requires dualLoggerLayer to be provided first.
 *
 * Usage:
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const { logger } = yield* LoggerConfig;
 *   yield* logger.info("Hello", { key: "value" });
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(LoggerConfigLayer)));
 * ```
 */
export const LoggerConfigLayer = Layer.effect(
  LoggerConfig,
  Effect.gen(function* () {
    const level = yield* parseLogLevel(yield* logLevelConfig);
    const logger = makeHarnessLogger({});

    return { logLevel: level, logger };
  }),
).pipe(Layer.provide(dualLoggerLayer));
