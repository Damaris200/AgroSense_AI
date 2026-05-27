import { describe, it, expect, afterAll, beforeEach, afterEach } from 'bun:test';
import { createApp } from '../app';

const TEST_SECRET = 'test-secret-key-for-unit-tests-only-32ch';

async function signJwt(payload: Record<string, unknown>, secret = TEST_SECRET): Promise<string> {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims  = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };
  const body    = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const encoder = new TextEncoder();
  const key     = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig     = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${Buffer.from(sig).toString('base64url')}`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const app    = createApp();
const server = app.listen(0);
const port   = (server.address() as { port: number }).port;

afterAll(() => { server.close(); });

type FetchFn = typeof globalThis.fetch;

function upstreamRouter(localPort: number, realFetch: FetchFn, routes: Array<{ match: string; body: unknown; status?: number }>, fallback: { body: unknown; status?: number } = { body: { success: true, data: [] } }): FetchFn {
  const fn = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (url.toString().includes(`127.0.0.1:${localPort}`)) return realFetch(url as string, init);
    const u = url.toString();
    for (const r of routes) {
      if (u.includes(r.match)) return jsonResponse(r.body, r.status ?? 200);
    }
    return jsonResponse(fallback.body, fallback.status ?? 200);
  };
  return fn as unknown as FetchFn;
}

// ── GET /api/admin/users ─────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  let originalFetch: FetchFn;
  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when authenticated user is not admin', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(403);
  });

  it('forwards to auth service when admin', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/auth/admin/users', body: { success: true, data: { users: [] } } },
    ]);
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});

// ── PATCH /api/admin/users/:id/active ────────────────────────────────────────

describe('PATCH /api/admin/users/:id/active', () => {
  let originalFetch: FetchFn;
  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users/u1/active`, { method: 'PATCH' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users/u1/active`, {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: false }),
    });
    expect(res.status).toBe(403);
  });

  it('forwards to auth service when admin', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/auth/admin/users/', body: { success: true } },
    ]);
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/users/u1/active`, {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: false }),
    });
    expect(res.status).toBe(200);
  });
});

// ── GET /api/admin/notifications ─────────────────────────────────────────────

describe('GET /api/admin/notifications', () => {
  let originalFetch: FetchFn;
  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/notifications`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(403);
  });

  it('returns enriched notifications when upstream returns notifications + users', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/admin/notifications', body: { success: true, data: [{ id: 'n1', userId: 'u1', farmId: 'f1', message: 'hi', channel: 'email', sentAt: '2024-01-01T00:00:00Z' }] } },
      { match: '/api/auth/admin/users', body: { success: true, data: { users: [{ id: 'u1', email: 'a@b.com', name: 'Anya' }] } } },
    ]);
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { success: boolean; data: Array<{ recipient: string; status: string }> };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data[0]?.recipient).toBe('a@b.com');
    expect(body.data[0]?.status).toBe('sent');
  });

  it('passes through upstream error status when notification service returns non-2xx', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/admin/notifications', body: { success: false, error: 'boom' }, status: 503 },
    ]);
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(503);
  });

  it('falls back to userId as recipient when matching user is missing', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/admin/notifications', body: { success: true, data: [{ id: 'n1', userId: 'unknown', farmId: 'f1', message: 'hi', channel: 'email', sentAt: '2024-01-01T00:00:00Z' }] } },
      { match: '/api/auth/admin/users', body: { success: true, data: { users: [] } } },
    ]);
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { data: Array<{ recipient: string }> };
    expect(body.data[0]?.recipient).toBe('unknown');
  });
});

// ── GET /api/admin/overview ──────────────────────────────────────────────────

describe('GET /api/admin/overview', () => {
  let originalFetch: FetchFn;
  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/overview`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(403);
  });

  it('aggregates upstream stats + health when admin', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [
      { match: '/api/auth/admin/users/stats', body: { data: { stats: { totalUsers: 7 } } } },
      { match: '/api/farms/admin/stats',      body: { data: { totalFarms: 4 } } },
      { match: '/api/admin/notifications/stats', body: { data: { totalNotifications: 12 } } },
      { match: '/api/admin/analytics/stats',  body: { data: { totalEvents: 50 } } },
      { match: '/api/admin/analytics/recent', body: { data: [{ eventType: 'farm.saved' }] } },
      { match: '/health', body: { status: 'ok' } },
    ]);
    const res  = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { data: { stats: { totalUsers: number; totalFarms: number; notificationsSent: number; eventsProcessed: number }; services: unknown[]; recentEvents: unknown[] } };
    expect(res.status).toBe(200);
    expect(body.data.stats.totalUsers).toBe(7);
    expect(body.data.stats.totalFarms).toBe(4);
    expect(body.data.stats.notificationsSent).toBe(12);
    expect(body.data.stats.eventsProcessed).toBe(50);
    expect(Array.isArray(body.data.services)).toBe(true);
    expect(body.data.recentEvents.length).toBe(1);
  });

  it('uses zero defaults when upstream returns no data', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = upstreamRouter(port, originalFetch, [], { body: {} });
    const res  = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { data: { stats: { totalUsers: number } } };
    expect(res.status).toBe(200);
    expect(body.data.stats.totalUsers).toBe(0);
  });

  it('marks services down when health probes fail', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      if (url.toString().includes(`127.0.0.1:${port}`)) return originalFetch(url as string, init);
      if (url.toString().includes('/health')) throw new Error('unreachable');
      return jsonResponse({ data: {} });
    }) as unknown as FetchFn;
    const res  = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { data: { services: Array<{ name: string; status: string }> } };
    expect(res.status).toBe(200);
    expect(body.data.services.every((s) => s.status === 'down')).toBe(true);
  });

  it('marks services degraded when health returns non-2xx', async () => {
    const token = await signJwt({ sub: 'admin-1', role: 'admin', email: 'a@b.com' });
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      if (url.toString().includes(`127.0.0.1:${port}`)) return originalFetch(url as string, init);
      if (url.toString().includes('/health')) return jsonResponse({}, 503);
      return jsonResponse({ data: {} });
    }) as unknown as FetchFn;
    const res  = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { data: { services: Array<{ status: string }> } };
    expect(body.data.services.every((s) => s.status === 'degraded')).toBe(true);
  });
});
