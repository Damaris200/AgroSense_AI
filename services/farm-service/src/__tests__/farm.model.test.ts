import { describe, it, expect } from 'bun:test';
import { farmSubmittedEventSchema } from '../models/farm.model';

describe('farmSubmittedEventSchema', () => {
  const validPayload = {
    submissionId: '11111111-1111-4111-8111-111111111111',
    userId: 'anonymous',
    cropType: 'maize',
    location: 'Yaounde',
    gpsLat: 3.848,
    gpsLng: 11.502,
    submittedAt: new Date().toISOString(),
  };

  it('accepts a valid farm submission event', () => {
    const result = farmSubmittedEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects missing cropType', () => {
    const { cropType: _, ...rest } = validPayload;
    const result = farmSubmittedEventSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing location', () => {
    const { location: _, ...rest } = validPayload;
    const result = farmSubmittedEventSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects gpsLat out of range', () => {
    const result = farmSubmittedEventSchema.safeParse({ ...validPayload, gpsLat: 999 });
    expect(result.success).toBe(false);
  });

  it('rejects gpsLng out of range', () => {
    const result = farmSubmittedEventSchema.safeParse({ ...validPayload, gpsLng: -999 });
    expect(result.success).toBe(false);
  });

  it('rejects empty cropType string', () => {
    const result = farmSubmittedEventSchema.safeParse({ ...validPayload, cropType: '' });
    expect(result.success).toBe(false);
  });

  it('defaults userId to anonymous when not provided', () => {
    const { userId: _, ...rest } = validPayload;
    const result = farmSubmittedEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.userId).toBe('anonymous');
  });
});