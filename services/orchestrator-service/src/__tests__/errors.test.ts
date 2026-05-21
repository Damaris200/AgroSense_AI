import { describe, it, expect } from 'bun:test';
import { AppError } from '../errors';

describe('AppError (orchestrator-service)', () => {
  it('stores message and statusCode', () => {
    const err = new AppError('Something went wrong', 500);
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
  });

  it('is an instance of Error', () => {
    const err = new AppError('test', 400);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  it('name defaults to "AppError"', () => {
    const err = new AppError('test', 400);
    expect(err.name).toBe('AppError');
  });

  it('supports custom status codes', () => {
    expect(new AppError('not found', 404).statusCode).toBe(404);
    expect(new AppError('conflict',  409).statusCode).toBe(409);
    expect(new AppError('server err', 500).statusCode).toBe(500);
  });

  it('can be caught as a generic Error', () => {
    try {
      throw new AppError('orchestration failed', 503);
    } catch (e) {
      expect(e instanceof Error).toBe(true);
      expect((e as AppError).statusCode).toBe(503);
    }
  });
});
