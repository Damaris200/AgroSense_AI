import { describe, it, expect, afterAll, beforeEach, afterEach } from 'bun:test';
import { createApp } from '../app';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEST_SECRET = 'test-secret-key-for-unit-tests-only-32ch';

async function signJwt(
  payload: Record<string, unknown>,
  secret = TEST_SECRET,
): Promise<string> {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims  = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };
  const body    = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const encoder = new TextEncoder();
  const key     = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${Buffer.from(sig).toString('base64url')}`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Shared server ─────────────────────────────────────────────────────────────

const app    = createApp();
const server = app.listen(0);
const port   = (server.address() as { port: number }).port;

afterAll(() => { server.close(); });

// ── URL-aware fetch mock factory ──────────────────────────────────────────────
// Pass through requests to the local test server; intercept upstream calls.

type FetchFn = typeof globalThis.fetch;

function upstreamMock(
  localPort: number,
  realFetch: FetchFn,
  mockResponse: unknown,
  mockStatus = 200,
): FetchFn {
  const fn = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (url.toString().includes(`127.0.0.1:${localPort}`)) {
      return realFetch(url as string, init);
    }
    return jsonResponse(mockResponse, mockStatus);
  };
  return fn as unknown as FetchFn;
}

function upstreamThrowMock(localPort: number, realFetch: FetchFn): FetchFn {
  const fn = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (url.toString().includes(`127.0.0.1:${localPort}`)) {
      return realFetch(url as string, init);
    }
    throw new Error('Service unavailable');
  };
  return fn as unknown as FetchFn;
}

// ── Weather route ─────────────────────────────────────────────────────────────

describe('GET /api/weather', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/weather`);
    expect(res.status).toBe(401);
  });

  it('returns 400 when farmId query param is missing', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/api/weather`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body  = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/farmId/i);
  });

  it('proxies the upstream response when farmId is present', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [{ temperature: 28 }] });

    const res  = await fetch(`http://127.0.0.1:${port}/api/weather?farmId=farm-123`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { success: boolean };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ── Soil route ────────────────────────────────────────────────────────────────

describe('GET /api/soil', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/soil`);
    expect(res.status).toBe(401);
  });

  it('returns 400 when farmId query param is missing', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    const res   = await fetch(`http://127.0.0.1:${port}/api/soil`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body  = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/farmId/i);
  });

  it('proxies upstream response when farmId is present', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [{ ph: 6.5 }] });

    const res  = await fetch(`http://127.0.0.1:${port}/api/soil?farmId=farm-123`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as { success: boolean };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ── Notification route ────────────────────────────────────────────────────────

describe('GET /api/notifications', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/notifications`);
    expect(res.status).toBe(401);
  });

  it('proxies upstream notification list when authenticated', async () => {
    const token = await signJwt({ sub: 'user-42', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [] });

    const res  = await fetch(`http://127.0.0.1:${port}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});

// ── Recommendations route ─────────────────────────────────────────────────────

describe('GET /api/recommendations', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/recommendations`);
    expect(res.status).toBe(401);
  });

  it('proxies upstream recommendations when authenticated', async () => {
    const token = await signJwt({ sub: 'user-1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [] });

    const res = await fetch(`http://127.0.0.1:${port}/api/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});

// ── Farm route – validation (no Kafka needed) ─────────────────────────────────

describe('POST /api/farm (body validation)', () => {
  it('returns 400 for missing cropType', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/api/farm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ location: 'Yaounde', gpsLat: 3.8, gpsLng: 11.5 }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid gpsLat', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/api/farm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cropType: 'maize', location: 'Yaounde', gpsLat: 999, gpsLng: 11.5 }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unknown extra fields (strict schema)', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/api/farm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cropType: 'maize', location: 'Yaounde', gpsLat: 3.8, gpsLng: 11.5, extra: 'bad' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty body', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/farm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

// ── Farm route – GET (auth required) ─────────────────────────────────────────

describe('GET /api/farm', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/farm`);
    expect(res.status).toBe(401);
  });

  it('proxies farm list when authenticated', async () => {
    const token = await signJwt({ sub: 'user-1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [] });

    const res = await fetch(`http://127.0.0.1:${port}/api/farm`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});

// ── Overview route ────────────────────────────────────────────────────────────

describe('GET /api/overview', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('returns 401 when no token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/overview`);
    expect(res.status).toBe(401);
  });

  it('returns aggregated stats and empty activity when upstream returns empty arrays', async () => {
    const token = await signJwt({ sub: 'user-1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: [] });

    const res  = await fetch(`http://127.0.0.1:${port}/api/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as {
      success: boolean;
      data: { stats: Record<string, number>; recentActivity: unknown[] }
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.stats).toBeDefined();
    expect(Array.isArray(body.data.recentActivity)).toBe(true);
  });

  it('handles upstream fetch failure gracefully (uses empty arrays)', async () => {
    const token = await signJwt({ sub: 'user-1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamThrowMock(port, originalFetch);

    const res  = await fetch(`http://127.0.0.1:${port}/api/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });

  it('returns activity sorted by most recent when upstream has data', async () => {
    const token = await signJwt({ sub: 'user-1', role: 'farmer', email: 'a@b.com' });
    let callCount = 0;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      if (url.toString().includes(`127.0.0.1:${port}`)) return originalFetch(url as string, init);
      callCount++;
      const urlStr = url.toString();
      if (urlStr.includes('/api/farms')) {
        return jsonResponse({ success: true, data: [{ id: 'f1', name: 'My Farm', cropType: 'maize', location: 'Yaounde', createdAt: '2024-01-01T00:00:00Z' }] });
      }
      if (urlStr.includes('/api/recommendations')) {
        return jsonResponse({ success: true, data: [{ id: 'r1', content: 'Apply more fertilizer', generatedAt: '2024-01-02T00:00:00Z' }] });
      }
      return jsonResponse({ success: true, data: [] });
    }) as unknown as FetchFn;

    const res  = await fetch(`http://127.0.0.1:${port}/api/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json() as {
      success: boolean;
      data: { stats: Record<string, number>; recentActivity: Array<{ type: string; text: string }> }
    };
    expect(res.status).toBe(200);
    expect(body.data.stats.farmsRegistered).toBe(1);
    expect(body.data.stats.analysesRun).toBe(1);
    expect(body.data.recentActivity.length).toBeGreaterThan(0);
  });
});

// ── Auth routes (forward) ─────────────────────────────────────────────────────

describe('Auth routes forwarding', () => {
  let originalFetch: FetchFn;

  beforeEach(() => { originalFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('POST /api/auth/register forwards to auth service', async () => {
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: { user: {}, token: 'tok' } }, 201);

    const res  = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'Anya', email: 'a@b.com', password: 'secret', locale: 'en' }),
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/auth/login forwards to auth service', async () => {
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: { user: {}, token: 'tok' } });

    const res  = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    });
    expect(res.status).toBe(200);
  });

  it('GET /api/auth/me forwards to auth service', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: { user: { id: 'u1' } } });

    const res = await fetch(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });

  it('PUT /api/auth/profile forwards to auth service', async () => {
    const token = await signJwt({ sub: 'u1', role: 'farmer', email: 'a@b.com' });
    globalThis.fetch = upstreamMock(port, originalFetch, { success: true, data: { user: { id: 'u1' } } });

    const res = await fetch(`http://127.0.0.1:${port}/api/auth/profile`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'New Name' }),
    });
    expect(res.status).toBe(200);
  });
});
