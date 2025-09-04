import pino from 'pino';
import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function validateLogLevel(envValue: string | undefined): LogLevel | null {
  if (!envValue) return null;
  const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  if (validLevels.includes(envValue as LogLevel)) {
    return envValue as LogLevel;
  }
  throw new Error(`Invalid LOG_LEVEL: ${envValue}. Valid values are: ${validLevels.join(', ')}`);
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const logs = './logs';
if (!fs.existsSync(logs)) {
  fs.mkdirSync(logs);
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'debug',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        destination: process.stderr.fd,
      },
    },
    {
      target: 'pino/file',
      level: 'debug',
      options: {
        destination: path.join(logs, 'benchmark.log'),
      },
    },
  ],
});

const pinoLogger = pino(transport);
pinoLogger.level = 'trace';

export class Logger {
  private static instance: Logger;
  private pino: pino.Logger;

  constructor(logLevel: LogLevel = validateLogLevel(process.env.LOG_LEVEL) || 'info') {
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
    this.pino.level = level === 'warn' ? 'warn' : level;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pino.debug(context, message);
    } else {
      this.pino.debug(message);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pino.info(context, message);
    } else {
      this.pino.info(message);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pino.warn(context, message);
    } else {
      this.pino.warn(message);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pino.error(context, message);
    } else {
      this.pino.error(message);
    }
  }

  getLogs(): LogEntry[] {
    console.warn('getLogs() is not supported with pino logger');
    return [];
  }

  clearLogs(): void {
    console.warn('clearLogs() is not supported with pino logger');
  }

  getLogsByLevel(_level: LogLevel): LogEntry[] {
    console.warn('getLogsByLevel() is not supported with pino logger');
    return [];
  }

  getLogsAfter(_timestamp: Date): LogEntry[] {
    console.warn('getLogsAfter() is not supported with pino logger');
    return [];
  }

  formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
  }

  exportLogs(): string {
    console.warn('exportLogs() is not supported with pino logger');
    return '';
  }
}