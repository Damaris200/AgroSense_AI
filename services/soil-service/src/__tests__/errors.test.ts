import { describe, it, expect } from 'bun:test';
import { AppError, NotFoundError, ValidationError } from '../errors';

describe('AppError subclasses (soil-service)', () => {
  it('NotFoundError has statusCode 404', () => {
    const err = new NotFoundError('Soil record not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Soil record not found');
    expect(err instanceof AppError).toBe(true);
  });

  it('ValidationError has statusCode 400', () => {
    const err = new ValidationError('farmId query param required');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('farmId query param required');
  });

  it('default messages are correct', () => {
    expect(new NotFoundError().message).toBe('Not found');
    expect(new ValidationError().message).toBe('Validation failed');
  });

  it('all errors are instances of AppError and Error', () => {
    const errors = [new NotFoundError(), new ValidationError()];
    for (const err of errors) {
      expect(err instanceof AppError).toBe(true);
      expect(err instanceof Error).toBe(true);
    }
  });

  it('name matches the constructor class name', () => {
    expect(new NotFoundError().name).toBe('NotFoundError');
    expect(new ValidationError().name).toBe('ValidationError');
  });
});
