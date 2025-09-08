import fs from "fs";
import path from "path";
import pino from "pino";
import { match } from "ts-pattern";

export type LogLevel = "debug" | "info" | "warn" | "error";

function validateLogLevel(envValue: string | undefined): LogLevel | null {
  if (!envValue) return null;
  const validLevels: LogLevel[] = ["debug", "info", "warn", "error"];
  if (validLevels.includes(envValue as LogLevel)) {
    return envValue as LogLevel;
  }
  throw new Error(
    `Invalid LOG_LEVEL: ${envValue}. Valid values are: ${validLevels.join(", ")}`,
  );
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const logs = "./logs";
if (!fs.existsSync(logs)) {
  fs.mkdirSync(logs);
}

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level: "debug",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        destination: process.stderr.fd,
      },
    },
    {
      target: "pino/file",
      level: "debug",
      options: {
        destination: path.join(logs, "benchmark.log"),
      },
    },
  ],
});

const pinoLogger = pino(
  {
    serializers: {
      claudeMessage: (message: any) => {
        if (!message || typeof message !== "object") {
          return message;
        }

        return match(message.type)
          .with("assistant", () => ({
            type: "assistant",
            model: (message as any).message?.model,
            contentCount: (message as any).message?.content?.length || 0,
            contentTypes:
              (message as any).message?.content?.map((c: any) => c.type) || [],
          }))
          .with("user", () => ({
            type: "user",
            contentCount: (message as any).message?.content?.length || 0,
            contentTypes:
              (message as any).message?.content?.map((c: any) => c.type) || [],
          }))
          .with("result", () => ({
            type: "result",
            subtype: (message as any).subtype,
            duration_ms: (message as any).duration_ms,
            total_cost_usd: (message as any).total_cost_usd,
            resultLength:
              (message as any).result &&
              typeof (message as any).result === "string"
                ? (message as any).result.length
                : undefined,
            resultPreview:
              (message as any).result &&
              typeof (message as any).result === "string" &&
              (message as any).result.length > 100
                ? (message as any).result.substring(0, 100) + "..."
                : (message as any).result,
          }))
          .with("system", () => ({
            type: "system",
            subtype: (message as any).subtype,
            apiKeySource:
              "apiKeySource" in message
                ? (message as any).apiKeySource
                : undefined,
            cwd: "cwd" in message ? (message as any).cwd : undefined,
          }))
          .otherwise(() => message);
      },
    },
    redact: {
      paths: [
        "claudeMessage.message.content[*].input.api_key",
        "claudeMessage.message.content[*].input.password",
        "claudeMessage.message.content[*].input.token",
      ],
      censor: "[REDACTED]",
    },
  },
  transport,
);
pinoLogger.level = "trace";

export class Logger {
  private static instance: Logger;
  private pino: pino.Logger;

  constructor(
    logLevel: LogLevel = validateLogLevel(process.env.LOG_LEVEL) || "info",
  ) {
    this.pino = pinoLogger;
    this.setLogLevel(logLevel);
  }

  static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    if (logLevel) {
      Logger.instance.setLogLevel(logLevel);
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.pino.level = level === "warn" ? "warn" : level;
  }

  debug(
    messageOrObj: string | Record<string, unknown>,
    message?: string,
  ): void {
    if (typeof messageOrObj === "string") {
      this.pino.debug(messageOrObj);
    } else {
      this.pino.debug(messageOrObj, message || "");
    }
  }

  info(messageOrObj: string | Record<string, unknown>, message?: string): void {
    if (typeof messageOrObj === "string") {
      this.pino.info(messageOrObj);
    } else {
      this.pino.info(messageOrObj, message || "");
    }
  }

  warn(messageOrObj: string | Record<string, unknown>, message?: string): void {
    if (typeof messageOrObj === "string") {
      this.pino.warn(messageOrObj);
    } else {
      this.pino.warn(messageOrObj, message || "");
    }
  }

  error(
    messageOrObj: string | Record<string, unknown>,
    message?: string,
  ): void {
    if (typeof messageOrObj === "string") {
      this.pino.error(messageOrObj);
    } else {
      this.pino.error(messageOrObj, message || "");
    }
  }

  // Structured logging methods with explicit context parameter
  debugWith(context: Record<string, unknown>, message?: string): void {
    this.pino.debug(context, message || "");
  }

  infoWith(context: Record<string, unknown>, message?: string): void {
    this.pino.info(context, message || "");
  }

  warnWith(context: Record<string, unknown>, message?: string): void {
    this.pino.warn(context, message || "");
  }

  errorWith(context: Record<string, unknown>, message?: string): void {
    this.pino.error(context, message || "");
  }

  getLogs(): LogEntry[] {
    console.warn("getLogs() is not supported with pino logger");
    return [];
  }

  clearLogs(): void {
    console.warn("clearLogs() is not supported with pino logger");
  }

  getLogsByLevel(_level: LogLevel): LogEntry[] {
    console.warn("getLogsByLevel() is not supported with pino logger");
    return [];
  }

  getLogsAfter(_timestamp: Date): LogEntry[] {
    console.warn("getLogsAfter() is not supported with pino logger");
    return [];
  }

  formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
  }

  exportLogs(): string {
    console.warn("exportLogs() is not supported with pino logger");
    return "";
  }
}
