import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

/**
 * requireAuth — verifies the Bearer JWT and attaches `req.user`.
 * Throws UnauthorizedError (401) if token is missing or invalid.
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: string; email: string };
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * requireRole — checks that req.user.role is one of the allowed roles.
 * Must be used after requireAuth.
 * Throws ForbiddenError (403) if the role is not allowed.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
}

/** @deprecated use requireAuth */
export const authenticate = requireAuth;
