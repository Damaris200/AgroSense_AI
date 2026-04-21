import { describe, it, expect } from 'bun:test';
import { buildRecommendationEmail } from '../services/email.service';

const event = {
  farmId:         'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  userId:         'c3d4e5f6-a7b8-9012-cdef-012345678912',
  userEmail:      'anya@farm.com',
  userName:       'Anya Okoro',
  recommendation: 'Plant maize between May 1–10 when soil moisture reaches 50%.',
  generatedAt:    '2026-04-21T12:00:00.000Z',
};

// ── buildRecommendationEmail ──────────────────────────────────────────────────

describe('buildRecommendationEmail', () => {
  it('sets the recipient to the user email', () => {
    const payload = buildRecommendationEmail(event);
    expect(payload.to).toBe(event.userEmail);
  });

  it('includes the user name in the subject or body', () => {
    const payload = buildRecommendationEmail(event);
    const combined = payload.subject + payload.html;
    expect(combined).toContain(event.userName);
  });

  it('includes the recommendation text in the email body', () => {
    const payload = buildRecommendationEmail(event);
    expect(payload.html).toContain(event.recommendation);
  });

  it('returns a non-empty subject', () => {
    const payload = buildRecommendationEmail(event);
    expect(payload.subject.trim().length).toBeGreaterThan(0);
  });

  it('returns valid HTML with at least one tag', () => {
    const payload = buildRecommendationEmail(event);
    expect(payload.html).toMatch(/<[a-z]/i);
  });

  it('does not expose farmId or userId in the email body', () => {
    const payload = buildRecommendationEmail(event);
    expect(payload.html).not.toContain(event.farmId);
    expect(payload.html).not.toContain(event.userId);
  });
});
