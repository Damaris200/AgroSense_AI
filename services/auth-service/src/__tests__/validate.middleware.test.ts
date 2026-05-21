import { describe, it, expect, afterAll } from 'bun:test';
import express from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';

const testSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  age:  z.number().int().positive('Age must be positive'),
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post('/test', validateBody(testSchema), (req, res) => {
    res.json({ success: true, data: req.body });
  });
  return app;
}

describe('validateBody middleware', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('passes a valid body to the next handler', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'Anya', age: 25 }),
    });
    const body = await res.json() as { success: boolean; data: { name: string; age: number } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Anya');
    expect(body.data.age).toBe(25);
  });

  it('returns 422 when a required field is invalid', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'A', age: 25 }),
    });
    const body = await res.json() as { success: boolean; error: string; details: Record<string, string[]> };
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
    expect(body.details.name).toBeDefined();
  });

  it('returns 422 when body is completely empty', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 when age is negative', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'Anya', age: -1 }),
    });
    const body = await res.json() as { success: boolean; details: Record<string, string[]> };
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.details.age).toBeDefined();
  });

  it('strips extra fields via Zod parsing', async () => {
    const res  = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'Anya', age: 30, extraField: 'ignored' }),
    });
    const body = await res.json() as { success: boolean; data: Record<string, unknown> };
    expect(res.status).toBe(200);
    expect(body.data.extraField).toBeUndefined();
  });

  it('returns JSON content-type on validation error', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'A' }),
    });
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });
});
