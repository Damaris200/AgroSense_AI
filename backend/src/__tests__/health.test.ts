import { describe, it, expect } from 'bun:test';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /api/v1/unknown', () => {
  it('returns 401 for unauthenticated requests to unknown routes', async () => {
    // Auth middleware runs before the 404 handler on secured routes
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
