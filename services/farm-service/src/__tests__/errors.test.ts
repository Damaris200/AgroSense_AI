import { describe, it, expect } from 'bun:test';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../errors';

describe('AppError subclasses (farm-service)', () => {
  it('ValidationError has statusCode 400', () => {
    const err = new ValidationError('Invalid coordinates');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid coordinates');
    expect(err instanceof AppError).toBe(true);
  });

  it('NotFoundError has statusCode 404', () => {
    const err = new NotFoundError('Farm not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Farm not found');
  });

  it('ConflictError has statusCode 409', () => {
    const err = new ConflictError('Duplicate submission');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Duplicate submission');
  });

  it('default messages are correct', () => {
    expect(new ValidationError().message).toBe('Validation failed');
    expect(new NotFoundError().message).toBe('Not found');
    expect(new ConflictError().message).toBe('Conflict');
  });

  it('instanceof checks work through the prototype chain', () => {
    const err = new NotFoundError();
    expect(err instanceof NotFoundError).toBe(true);
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('name matches the constructor name', () => {
    expect(new ValidationError().name).toBe('ValidationError');
    expect(new NotFoundError().name).toBe('NotFoundError');
    expect(new ConflictError().name).toBe('ConflictError');
  });
});
