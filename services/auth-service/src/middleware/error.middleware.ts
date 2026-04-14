import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    const message =
      err.errorCode === 'P1000'
        ? 'Database authentication failed. Check DATABASE_URL credentials.'
        : 'Database connection failed. Make sure PostgreSQL is running.';

    logger.error(message, { stack: err.stack });
    return res.status(503).json({ success: false, error: message });
  }

  logger.error(err.message, { stack: err.stack });
  const message = env.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ success: false, error: message });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found' });
}
