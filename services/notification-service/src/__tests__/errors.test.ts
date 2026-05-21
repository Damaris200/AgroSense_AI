import { describe, it, expect } from 'bun:test';
import { AppError, NotFoundError, ValidationError } from '../errors';

describe('AppError subclasses (notification-service)', () => {
  it('NotFoundError has statusCode 404', () => {
    const err = new NotFoundError('Notification not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Notification not found');
    expect(err instanceof AppError).toBe(true);
  });

  it('ValidationError has statusCode 400', () => {
    const err = new ValidationError('Invalid notification payload');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid notification payload');
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
