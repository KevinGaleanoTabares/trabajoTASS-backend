import { tmpdir } from 'node:os';
import { join } from 'node:path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

type LogContext = Record<string, string | number | boolean>;

const dailyFileTransport = new DailyRotateFile({
  filename: join(tmpdir(), 'tass-backend-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
  format: format.combine(
    format((info) => ({
      ...info,
      mensaje: info.message,
      servicio: 'tass-backend',
      entorno: process.env.NODE_ENV ?? 'local',
    }))(),
    format.timestamp(),
    format.json(),
  ),
});

export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), format.json()),
    }),
    dailyFileTransport,
  ],
});

export function logInfo(event: string, context: LogContext = {}): void {
  logger.log({
    level: 'info',
    message: event,
    event,
    ...context,
  });
}

export function logError(event: string, error: unknown, context: LogContext = {}): void {
  const errorName = error instanceof Error ? error.name : 'UnknownError';

  logger.log({
    level: 'error',
    message: event,
    event,
    ...context,
    error: { name: errorName },
  });
}
