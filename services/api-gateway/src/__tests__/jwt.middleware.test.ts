import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/jwt';

const TEST_SECRET = 'test-secret-key-for-unit-tests-only-32ch';

async function signJwt(
  payload: Record<string, unknown>,
  secret = TEST_SECRET,
): Promise<string> {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims  = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const body    = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const encoder = new TextEncoder();
  const key     = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig     = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${Buffer.from(sig).toString('base64url')}`;
}

function buildApp() {
  const app = express();
  app.get('/protected', requireAuth, (req: Request, res: Response) => {
    res.json({ ok: true, user: req.jwtUser });
  });
  app.get('/optional', optionalAuth, (req: Request, res: Response) => {
    res.json({ ok: true, user: req.jwtUser ?? null });
  });
  return app;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('returns 401 when Authorization header is absent', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/protected`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('returns 401 for a non-Bearer scheme', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed JWT', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: 'Bearer not.a.valid.jwt' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a JWT signed with a wrong secret', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 't@t.com' }, 'wrong-secret');
    const res   = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('passes through and exposes jwtUser for a valid token', async () => {
    const token = await signJwt({ sub: 'user-123', role: 'farmer', email: 'farmer@farm.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body  = await res.json() as { ok: boolean; user: { sub: string; role: string } };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.user.sub).toBe('user-123');
    expect(body.user.role).toBe('farmer');
  });

  it('returns 401 for an expired token', async () => {
    const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const claims  = { sub: 'u1', role: 'farmer', email: 't@t.com', exp: Math.floor(Date.now() / 1000) - 1 };
    const bodyStr = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const encoder = new TextEncoder();
    const key     = await crypto.subtle.importKey(
      'raw', encoder.encode(TEST_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig     = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${bodyStr}`));
    const token   = `${header}.${bodyStr}.${Buffer.from(sig).toString('base64url')}`;

    const res = await fetch(`http://127.0.0.1:${port}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });
});

// ── optionalAuth ──────────────────────────────────────────────────────────────

describe('optionalAuth', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('calls next() with no jwtUser when no token is provided', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/optional`);
    const body = await res.json() as { ok: boolean; user: null };
    expect(res.status).toBe(200);
    expect(body.user).toBeNull();
  });

  it('sets jwtUser when a valid token is provided', async () => {
    const token = await signJwt({ sub: 'user-456', role: 'admin', email: 'admin@farm.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/optional`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body  = await res.json() as { ok: boolean; user: { sub: string; role: string } };
    expect(res.status).toBe(200);
    expect(body.user?.sub).toBe('user-456');
    expect(body.user?.role).toBe('admin');
  });

  it('silently ignores an invalid token (user stays null)', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/optional`, {
      headers: { Authorization: 'Bearer bad.token.here' },
    });
    const body = await res.json() as { user: null };
    expect(res.status).toBe(200);
    expect(body.user).toBeNull();
  });
});
