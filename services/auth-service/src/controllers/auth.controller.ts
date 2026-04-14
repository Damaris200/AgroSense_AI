import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors';
import { ok, created } from '../utils/response';

export async function register(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await authService.registerUser(req.body);
    const token = authService.signAuthToken(user);
    created(_res, { user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, _res: Response, next: NextFunction) {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password);
    ok(_res, { user, token });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new UnauthorizedError());
    const user = await authService.getUserById(req.user.id);
    if (!user) return next(new NotFoundError('User not found'));
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}
