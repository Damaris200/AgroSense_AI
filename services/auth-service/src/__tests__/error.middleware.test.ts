import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response, type NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../errors';

function buildApp() {
  const app = express();

  app.get('/throw-validation',   (_req, _res, next) => next(new ValidationError('bad input')));
  app.get('/throw-unauthorized', (_req, _res, next) => next(new UnauthorizedError()));
  app.get('/throw-forbidden',    (_req, _res, next) => next(new ForbiddenError()));
  app.get('/throw-notfound',     (_req, _res, next) => next(new NotFoundError('User not found')));
  app.get('/throw-conflict',     (_req, _res, next) => next(new ConflictError('Email taken')));
  app.get('/throw-generic',      (_req, _res, next) => next(new Error('Unexpected boom')));
  app.get('/ok',                 (_req, res)         => res.json({ ok: true }));

  app.use(notFoundHandler);
  app.use((err: Error, req: Request, res: Response, next: NextFunction) =>
    errorHandler(err, req, res, next),
  );

  return app;
}

describe('errorHandler', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 400 for ValidationError', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/throw-validation`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('bad input');
  });

  it('returns 401 for UnauthorizedError', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/throw-unauthorized`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for ForbiddenError', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/throw-forbidden`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for NotFoundError with custom message', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/throw-notfound`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(404);
    expect(body.error).toBe('User not found');
  });

  it('returns 409 for ConflictError', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/throw-conflict`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(409);
    expect(body.error).toBe('Email taken');
  });

  it('returns 500 for generic errors in non-production', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/throw-generic`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unexpected boom');
  });

  it('all AppError responses include success:false', async () => {
    for (const path of ['/throw-validation', '/throw-unauthorized', '/throw-forbidden']) {
      const res  = await fetch(`http://127.0.0.1:${port}${path}`);
      const body = await res.json() as { success: boolean };
      expect(body.success).toBe(false);
    }
  });
});

describe('notFoundHandler', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 404 for unknown routes', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/does-not-exist`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Route not found');
  });

  it('does not intercept existing routes', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/ok`);
    expect(res.status).toBe(200);
  });
});
