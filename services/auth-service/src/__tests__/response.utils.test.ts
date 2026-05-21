import { describe, it, expect } from 'bun:test';
import { ok, created, fail } from '../utils/response';

function mockRes() {
  const res = {
    _status: 0,
    _body: null as unknown,
    status(code: number) { this._status = code; return this; },
    json(data: unknown)  { this._body  = data; return this; },
  };
  return res as typeof res & { status(c: number): typeof res; json(d: unknown): typeof res };
}

describe('ok()', () => {
  it('writes status 200 by default', () => {
    const res = mockRes();
    ok(res as never, { id: 1 });
    expect(res._status).toBe(200);
  });

  it('writes success:true and the data payload', () => {
    const res = mockRes();
    ok(res as never, { name: 'Anya' });
    expect((res._body as Record<string, unknown>).success).toBe(true);
    expect((res._body as Record<string, unknown>).data).toEqual({ name: 'Anya' });
  });

  it('accepts a custom status code', () => {
    const res = mockRes();
    ok(res as never, null, 202);
    expect(res._status).toBe(202);
  });
});

describe('created()', () => {
  it('writes status 201', () => {
    const res = mockRes();
    created(res as never, { id: 'abc' });
    expect(res._status).toBe(201);
  });

  it('includes the data in the response body', () => {
    const res = mockRes();
    created(res as never, { id: 'abc' });
    expect((res._body as Record<string, unknown>).data).toEqual({ id: 'abc' });
  });
});

describe('fail()', () => {
  it('writes status 400 by default', () => {
    const res = mockRes();
    fail(res as never, 'Something went wrong');
    expect(res._status).toBe(400);
  });

  it('writes success:false and the error message', () => {
    const res = mockRes();
    fail(res as never, 'Email not found');
    expect((res._body as Record<string, unknown>).success).toBe(false);
    expect((res._body as Record<string, unknown>).error).toBe('Email not found');
  });

  it('accepts a custom error status code', () => {
    const res = mockRes();
    fail(res as never, 'Conflict', 409);
    expect(res._status).toBe(409);
  });
});
