import { describe, it, expect, afterAll } from 'bun:test';
import { createApp } from '../app';

describe('API Gateway — createApp()', () => {
  const app    = createApp();
  const server = app.listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('GET /health returns status ok', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await res.json() as { status: string; service: string; timestamp: string };
    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api-gateway');
    expect(typeof body.timestamp).toBe('string');
  });

  it('GET /health responds as JSON', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('unknown route returns 404 with Route not found', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/api/definitely-not-a-route`);
    const body = await res.json() as { success: boolean; error: string };
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Route not found');
  });

  it('app returns 404 for completely unknown paths', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/random/path/xyz`);
    expect(res.status).toBe(404);
  });
});
