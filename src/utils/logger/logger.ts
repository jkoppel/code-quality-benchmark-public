import fs from "fs";
import path from "path";
import pino from "pino";
import { LogLayer } from "loglayer";
import { PinoTransport } from "@loglayer/transport-pino";
import type { ILogLayer } from "loglayer";
import { claudeCodeSerializer } from "./serializer.js";

const DEFAULT_LOG_LEVEL = "info";
const LOG_DIR = "./logs"; // TODO: make this configurable

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

/*************************************************
    Harness-wide Log Level and Logger Instance
**************************************************/

export type LogLevel = "debug" | "info" | "warn" | "error";
export type Logger = ILogLayer;

/** Harness-wide logger instance */
let loggerInstance: Logger;

export function getLoggerConfig(): { logger: Logger; logLevel: LogLevel } {
  const logLevel = getLogLevel();
  if (!loggerInstance) {
    loggerInstance = new LogLayer({
      transport: new PinoTransport({
        logger: createPinoLogger(logLevel),
      }),
    });
  }

  return { logger: loggerInstance, logLevel };
}

/*
- Using LogLayer allows us to easily swap between underlying logger libs in the future; it also has a nice fluent API. 
- Decided not to roll our own Logger wrapper
because LogLayer already does that kind of wrapping well enough, 
and because there are various complications involved in wrapping a pino logger properly (eg child loggers wouldn't work on a naive wrapper approach)
*/

export function getLogLevel(): LogLevel {
  function validateLogLevel(level: string): LogLevel {
    const validLevels: LogLevel[] = ["debug", "info", "warn", "error"];
    if (validLevels.includes(level as LogLevel)) {
      return level as LogLevel;
    }
    throw new Error(
      `Invalid LOG_LEVEL: ${level}. Valid values are: ${validLevels.join(", ")}`,
    );
  }

  return validateLogLevel(process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL);
}

/**************************************
  Underlying Pino Logger / Transport
***************************************/

function createPinoLogger(logLevel: LogLevel) {
  const transport = pino.transport({
    targets: [
      {
        target: "pino-pretty",
        level: logLevel,
        options: {
          colorize: true,
          ignore: "pid,hostname",
          destination: process.stderr.fd,
          singleLine: false,
        },
      },
      {
        target: "pino/file",
        level: "trace", // Log everything to file
        options: {
          // TODO: Will want to make this configurable
          destination: path.join(LOG_DIR, "benchmark.log"),
        },
      },
    ],
  });

  return pino(
    {
      serializers: {
        claudeCode: claudeCodeSerializer,
      },
      redact: {
        paths: [
          "claudeCode.message.content[*].input.api_key",
          "claudeCode.message.content[*].input.password",
          "claudeCode.message.content[*].input.token",
        ],
        censor: "[REDACTED]",
      },
      level: "trace",
      // Level for the base logger -- required even though the transports also have a level
    },
    transport,
  );
}
