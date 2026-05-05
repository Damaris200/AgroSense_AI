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

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new UnauthorizedError());
    const { name, phone, locale } = req.body as { name?: string; phone?: string; locale?: string };
    const normalizedLocale = locale === 'en' || locale === 'fr' ? locale : undefined;
    const user = await authService.updateProfile(req.user.id, { name, phone, locale: normalizedLocale });
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ids = (req.query.ids as string | undefined)
      ?.split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const limit = Number(req.query.limit ?? 100);
    const users = await authService.listUsers({ ids, limit });
    ok(res, { users });
  } catch (err) {
    next(err);
  }
}

export async function getUserStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await authService.getUserStats();
    ok(res, { stats });
  } catch (err) {
    next(err);
  }
}

export async function updateUserActive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.body as { isActive: boolean };
    const user = await authService.setUserActive(req.params.id!, Boolean(isActive));
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}
