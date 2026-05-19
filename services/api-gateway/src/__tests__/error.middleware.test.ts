import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response, type NextFunction } from 'express';
import { AppError, NotFoundError, notFoundHandler, errorHandler } from '../middleware/error';

// ── Class unit tests ──────────────────────────────────────────────────────────

describe('AppError', () => {
  it('stores message and statusCode', () => {
    const err = new AppError('Forbidden', 403);
    expect(err.message).toBe('Forbidden');
    expect(err.statusCode).toBe(403);
    expect(err).toBeInstanceOf(Error);
  });

  it('is a proper Error subclass', () => {
    const err = new AppError('Bad request', 400);
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

describe('NotFoundError', () => {
  it('defaults to status 404 and message "Not found"', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('accepts a custom message', () => {
    const err = new NotFoundError('Resource missing');
    expect(err.message).toBe('Resource missing');
    expect(err.statusCode).toBe(404);
  });
});

// ── notFoundHandler integration test ─────────────────────────────────────────

describe('notFoundHandler', () => {
  const app    = express();
  app.use(notFoundHandler);
  const server = app.listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 404 with { success: false, error: "Route not found" }', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/anything`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Route not found');
  });
});

// ── errorHandler integration test ────────────────────────────────────────────

describe('errorHandler', () => {
  function buildErrorApp() {
    const app = express();
    app.get('/app-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new AppError('Payment required', 402));
    });
    app.get('/generic-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Unexpected failure'));
    });
    app.use(errorHandler);
    return app;
  }

  const server = buildErrorApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('responds with AppError status and message', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/app-error`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(402);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Payment required');
  });

  it('responds with 500 for generic errors in test/dev mode', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/generic-error`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe('string');
  });
});
