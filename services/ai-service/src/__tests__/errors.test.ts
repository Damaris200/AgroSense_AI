import { describe, it, expect } from 'bun:test';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../errors';

describe('AppError subclasses (ai-service)', () => {
  it('ValidationError has statusCode 400', () => {
    const err = new ValidationError('Invalid analysis payload');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid analysis payload');
    expect(err instanceof AppError).toBe(true);
  });

  it('NotFoundError has statusCode 404', () => {
    const err = new NotFoundError('Recommendation not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Recommendation not found');
  });

  it('ConflictError has statusCode 409', () => {
    const err = new ConflictError('Duplicate recommendation');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Duplicate recommendation');
  });

  it('default messages are correct', () => {
    expect(new ValidationError().message).toBe('Validation failed');
    expect(new NotFoundError().message).toBe('Not found');
    expect(new ConflictError().message).toBe('Conflict');
  });

  it('all errors are instances of AppError and Error', () => {
    const errors = [new ValidationError(), new NotFoundError(), new ConflictError()];
    for (const err of errors) {
      expect(err instanceof AppError).toBe(true);
      expect(err instanceof Error).toBe(true);
    }
  });

  it('name matches the constructor class name', () => {
    expect(new ValidationError().name).toBe('ValidationError');
    expect(new NotFoundError().name).toBe('NotFoundError');
    expect(new ConflictError().name).toBe('ConflictError');
  });
});
