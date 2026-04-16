import { describe, it, expect } from 'bun:test';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../errors';

describe('AppError subclasses', () => {
  it('ValidationError has status 400', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad input');
    expect(err instanceof AppError).toBe(true);
  });

  it('UnauthorizedError has status 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  it('ForbiddenError has status 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError has status 404', () => {
    const err = new NotFoundError('User not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('ConflictError has status 409', () => {
    const err = new ConflictError('Email already in use');
    expect(err.statusCode).toBe(409);
  });

  it('instanceof checks work correctly', () => {
    const err = new ConflictError();
    expect(err instanceof ConflictError).toBe(true);
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});
