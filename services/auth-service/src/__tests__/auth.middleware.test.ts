import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.middleware';

const SECRET = process.env.JWT_SECRET!;

function makeToken(payload: Record<string, unknown>, secret = SECRET, expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

function buildApp() {
  const app = express();

  app.get('/protected', requireAuth, (req: AuthRequest, res: Response) => {
    res.json({ ok: true, user: req.user });
  });

  app.get('/admin-only',
    requireAuth,
    requireRole('admin'),
    (_req: Request, res: Response) => { res.json({ ok: true }); },
  );

  app.get('/multi-role',
    requireAuth,
    requireRole('admin', 'farmer'),
    (_req: Request, res: Response) => { res.json({ ok: true }); },
  );

  app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  });

  return app;
}

describe('requireAuth', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 401 when Authorization header is absent', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/protected`);
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-Bearer scheme', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed token', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: 'Bearer not.a.valid.token' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a token signed with wrong secret', async () => {
    const token = makeToken({ sub: 'u1', role: 'farmer', email: 'a@b.com' }, 'wrong-secret');
    const res   = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const token = makeToken({ sub: 'u1', role: 'farmer', email: 'a@b.com' }, SECRET, '-1s');
    const res   = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('passes through with user attached for a valid token', async () => {
    const token = makeToken({ sub: 'user-abc', role: 'farmer', email: 'anya@farm.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body  = await res.json() as { ok: boolean; user: { id: string; role: string; email: string } };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.user.id).toBe('user-abc');
    expect(body.user.role).toBe('farmer');
    expect(body.user.email).toBe('anya@farm.com');
  });
});

describe('requireRole', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 403 when user role is not in the allowed list', async () => {
    const token = makeToken({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/admin-only`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(403);
  });

  it('passes through when role matches exactly', async () => {
    const token = makeToken({ sub: 'u1', role: 'admin', email: 'admin@farm.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/admin-only`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });

  it('passes through when role is one of multiple allowed roles', async () => {
    const token = makeToken({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/multi-role`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});
