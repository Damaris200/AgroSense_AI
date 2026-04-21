import { describe, it, expect } from 'bun:test';
import { recommendationGeneratedEventSchema } from '../models/notification.model';

const validEvent = {
  farmId:         'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  userId:         'c3d4e5f6-a7b8-9012-cdef-012345678912',
  userEmail:      'anya@farm.com',
  userName:       'Anya Okoro',
  recommendation: 'Plant maize between May 1–10 when soil moisture reaches 50%.',
  generatedAt:    '2026-04-21T12:00:00.000Z',
};

describe('recommendationGeneratedEventSchema', () => {
  it('accepts a valid recommendation.generated payload', () => {
    expect(recommendationGeneratedEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, userEmail: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('userEmail');
  });

  it('rejects non-uuid farmId', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, farmId: 'bad-id' });
    expect(result.success).toBe(false);
  });

  it('rejects empty recommendation text', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, recommendation: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('recommendation');
  });

  it('rejects empty userName', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, userName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const { userEmail: _, ...rest } = validEvent;
    expect(recommendationGeneratedEventSchema.safeParse(rest).success).toBe(false);
  });
});
