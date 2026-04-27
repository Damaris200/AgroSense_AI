import { describe, it, expect } from 'bun:test';

// Pure helper — extracts submissionId safely from any event payload
function extractSubmissionId(payload: Record<string, unknown>): string {
  return typeof payload.submissionId === 'string'
    ? payload.submissionId
    : 'unknown';
}

// Pure helper — checks if a topic is one we track
const TRACKED_TOPICS = [
  'farm.submitted',
  'farm.saved',
  'analysis.ready',
  'recommendation.generated',
];

function isTrackedTopic(topic: string): boolean {
  return TRACKED_TOPICS.includes(topic);
}

describe('extractSubmissionId', () => {
  it('returns submissionId when present', () => {
    const payload = { submissionId: '11111111-1111-4111-8111-111111111111' };
    expect(extractSubmissionId(payload)).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('returns unknown when submissionId is missing', () => {
    expect(extractSubmissionId({})).toBe('unknown');
  });

  it('returns unknown when submissionId is not a string', () => {
    expect(extractSubmissionId({ submissionId: 123 })).toBe('unknown');
  });
});

describe('isTrackedTopic', () => {
  it('returns true for farm.submitted', () => {
    expect(isTrackedTopic('farm.submitted')).toBe(true);
  });

  it('returns true for farm.saved', () => {
    expect(isTrackedTopic('farm.saved')).toBe(true);
  });

  it('returns true for analysis.ready', () => {
    expect(isTrackedTopic('analysis.ready')).toBe(true);
  });

  it('returns true for recommendation.generated', () => {
    expect(isTrackedTopic('recommendation.generated')).toBe(true);
  });

  it('returns false for unknown topics', () => {
    expect(isTrackedTopic('some.random.topic')).toBe(false);
  });
});