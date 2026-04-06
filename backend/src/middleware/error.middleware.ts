import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Typed application errors — safe to expose message to client
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // Unknown / unexpected errors
  logger.error(err.message, { stack: err.stack });
  const message = env.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ success: false, error: message });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found' });
}
