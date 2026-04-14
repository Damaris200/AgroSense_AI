import { env } from '../config/env';

type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, meta?: unknown) {
  if (level === 'debug' && env.nodeEnv === 'production') return;
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    ...(meta !== undefined ? { meta } : {}),
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (msg: string, meta?: unknown) => log('info',  msg, meta),
  warn:  (msg: string, meta?: unknown) => log('warn',  msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
};
