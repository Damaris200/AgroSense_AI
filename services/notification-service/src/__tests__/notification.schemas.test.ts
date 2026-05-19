import { describe, it, expect } from 'bun:test';
import { recommendationGeneratedEventSchema } from '../models/notification.model';

const validEvent = {
  submissionId:   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  farmId:         '22222222-2222-4222-8222-222222222222',
  userId:         '33333333-3333-4333-8333-333333333333',
  userEmail:      'anya@farm.com',
  userName:       'Anya Okoro',
  recommendation: 'Plant maize between May 1–10 when soil moisture reaches 50%.',
  generatedAt:    '2026-04-21T12:00:00.000Z',
};

describe('recommendationGeneratedEventSchema', () => {
  it('accepts a valid recommendation.generated payload', () => {
    expect(recommendationGeneratedEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it('accepts anonymous userId', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, userId: 'anonymous' });
    expect(result.success).toBe(true);
  });

  it('rejects missing submissionId', () => {
    const { submissionId: _, ...rest } = validEvent;
    expect(recommendationGeneratedEventSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects non-uuid submissionId', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, submissionId: 'bad-id' });
    expect(result.success).toBe(false);
  });

  it('rejects non-uuid farmId', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, farmId: 'bad-id' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only recommendation', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, recommendation: '   ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('recommendation');
  });

  it('rejects empty recommendation text', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, recommendation: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('recommendation');
  });

  it('rejects invalid datetime in generatedAt', () => {
    const result = recommendationGeneratedEventSchema.safeParse({ ...validEvent, generatedAt: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('defaults userEmail to empty string when omitted', () => {
    const { userEmail: _, ...rest } = validEvent;
    const result = recommendationGeneratedEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.userEmail).toBe('');
  });

  it('defaults userName to empty string when omitted', () => {
    const { userName: _, ...rest } = validEvent;
    const result = recommendationGeneratedEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.userName).toBe('');
  });
});
