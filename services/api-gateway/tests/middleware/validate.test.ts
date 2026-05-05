/**
 * Unit tests for the validateBody middleware.
 *
 * A minimal Express app is created inline — no real gateway boot required.
 * Run: bun test tests/middleware/validate.test.ts
 */

import { describe, it, expect, afterAll } from 'bun:test';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../src/middleware/validate';

// ── Minimal test schema ───────────────────────────────────────────────────────

const testSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    age: z.number({ invalid_type_error: 'age must be a number' }),
  })
  .strict();

// ── Minimal Express app ───────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/test', validateBody(testSchema), (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, data: _req.body });
  });

  return app;
}

async function postJson(port: number, body: unknown) {
  return fetch(`http://127.0.0.1:${port}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('validateBody middleware', () => {
  const app = buildApp();
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;

  afterAll(() => {
    server.close();
  });

  it('passes a valid body through and calls next()', async () => {
    const res = await postJson(port, { name: 'Alice', age: 30 });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ name: 'Alice', age: 30 });
  });

  it('returns 400 when a required field is missing', async () => {
    const res = await postJson(port, { name: 'Alice' });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThan(0);
  });

  it('returns 400 when a field has the wrong type', async () => {
    const res = await postJson(port, { name: 'Alice', age: 'not-a-number' });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
    const ageError = body.details.find(
      (d: { path: string; message: string }) => d.path === 'age'
    );
    expect(ageError).toBeDefined();
    expect(typeof ageError.message).toBe('string');
  });

  it('returns 400 for unknown extra fields (.strict())', async () => {
    const res = await postJson(port, { name: 'Alice', age: 30, extra: 'unwanted' });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
  });

  it('returns 400 for an empty body', async () => {
    const res = await postJson(port, {});
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('ValidationError');
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('does NOT call next() on validation failure (handler body is never reached)', async () => {
    const res = await postJson(port, { name: 'Alice' });
    const body = await res.json();

    // If next() had been called, the handler would set ok:true
    expect(body.ok).toBeUndefined();
  });
});
