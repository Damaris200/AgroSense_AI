import { describe, it, expect } from 'bun:test';
import { AppError } from '../errors';

describe('AppError (analytics-service)', () => {
  it('stores message and statusCode', () => {
    const err = new AppError('Invalid event payload', 400);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid event payload');
  });

  it('is an instance of Error and AppError', () => {
    const err = new AppError('test', 404);
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('name defaults to "AppError"', () => {
    expect(new AppError('msg', 400).name).toBe('AppError');
  });

  it('supports common HTTP status codes', () => {
    expect(new AppError('bad request',  400).statusCode).toBe(400);
    expect(new AppError('not found',    404).statusCode).toBe(404);
    expect(new AppError('server error', 500).statusCode).toBe(500);
  });

  it('can be caught as a generic Error', () => {
    try {
      throw new AppError('analytics failed', 503);
    } catch (e) {
      expect(e instanceof Error).toBe(true);
      expect((e as AppError).statusCode).toBe(503);
      expect((e as AppError).message).toBe('analytics failed');
    }
  });
});
