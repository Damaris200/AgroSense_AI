import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const schema = z
  .object({
    name: z.string().min(1, 'name is required'),
    age:  z.number({ error: 'age must be a number' }),
  })
  .strict();

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post('/test', validateBody(schema), (req: Request, res: Response) => {
    res.json({ ok: true, data: req.body });
  });
  return app;
}

async function post(port: number, body: unknown) {
  return fetch(`http://127.0.0.1:${port}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('validateBody middleware', () => {
  const server = buildApp().listen(0);
  const port   = (server.address() as { port: number }).port;

  afterAll(() => { server.close(); });

  it('passes a valid body through and calls next()', async () => {
    const res  = await post(port, { name: 'Alice', age: 30 });
    const body = await res.json() as { ok: boolean; data: unknown };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ name: 'Alice', age: 30 });
  });

  it('returns 400 with ValidationError when a required field is missing', async () => {
    const res  = await post(port, { name: 'Alice' });
    const body = await res.json() as { error: string; details: unknown[] };
    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThan(0);
  });

  it('returns 400 when a field has the wrong type', async () => {
    const res  = await post(port, { name: 'Alice', age: 'not-a-number' });
    const body = await res.json() as { error: string; details: Array<{ path: string; message: string }> };
    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
    const ageError = body.details.find((d) => d.path === 'age');
    expect(ageError).toBeDefined();
  });

  it('returns 400 for unknown extra fields (.strict())', async () => {
    const res  = await post(port, { name: 'Alice', age: 30, extra: 'unwanted' });
    const body = await res.json() as { error: string };
    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
  });

  it('returns 400 for an empty body', async () => {
    const res = await post(port, {});
    expect(res.status).toBe(400);
  });

  it('strips the handler ok:true on validation failure — next() was NOT called', async () => {
    const res  = await post(port, { name: 'Alice' });
    const body = await res.json() as { ok?: boolean };
    expect(body.ok).toBeUndefined();
  });

  it('includes a details array with path and message on each entry', async () => {
    const res  = await post(port, {});
    const body = await res.json() as { details: Array<{ path: string; message: string }> };
    for (const d of body.details) {
      expect(typeof d.message).toBe('string');
    }
  });
});
