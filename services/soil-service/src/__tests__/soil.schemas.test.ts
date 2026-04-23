import { describe, it, expect } from 'bun:test';
import { farmSavedEventSchema, soilAnalyzedEventSchema } from '../models/soil.model';

const validFarmSaved = {
  submissionId: '11111111-1111-4111-8111-111111111111',
  farmId:       '22222222-2222-4222-8222-222222222222',
  userId:       '33333333-3333-4333-8333-333333333333',
  name:         'Okoro Farm',
  location:     'Enugu, Nigeria',
  cropType:     'maize',
  gpsLat:       6.4541,
  gpsLng:       7.5087,
  savedAt:      '2026-04-21T10:00:00.000Z',
};

// ── farmSavedEventSchema ──────────────────────────────────────────────────────

describe('farmSavedEventSchema', () => {
  it('accepts a valid farm.saved payload', () => {
    expect(farmSavedEventSchema.safeParse(validFarmSaved).success).toBe(true);
  });

  it('rejects latitude outside valid range', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, gpsLat: 120 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude outside valid range', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, gpsLng: -190 });
    expect(result.success).toBe(false);
  });

  it('rejects empty cropType', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, cropType: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing submissionId', () => {
    const { submissionId: _, ...rest } = validFarmSaved;
    expect(farmSavedEventSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects non-uuid farmId', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, farmId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric gpsLat', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, gpsLat: 'six' });
    expect(result.success).toBe(false);
  });
});

// ── soilAnalyzedEventSchema ───────────────────────────────────────────────────

const validSoilAnalyzed = {
  submissionId: '11111111-1111-4111-8111-111111111111',
  farmId:       '22222222-2222-4222-8222-222222222222',
  userId:       '33333333-3333-4333-8333-333333333333',
  soilDataId:   '44444444-4444-4444-8444-444444444444',
  ph:           6.5,
  moisture:     45.2,
  nitrogen:     120.0,
  phosphorus:   40.5,
  potassium:    200.0,
  analyzedAt:   '2026-04-21T10:05:00.000Z',
};

describe('soilAnalyzedEventSchema', () => {
  it('accepts a valid soil.analyzed payload', () => {
    expect(soilAnalyzedEventSchema.safeParse(validSoilAnalyzed).success).toBe(true);
  });

  it('rejects pH above 14', () => {
    const result = soilAnalyzedEventSchema.safeParse({ ...validSoilAnalyzed, ph: 15 });
    expect(result.success).toBe(false);
  });

  it('rejects pH below 0', () => {
    const result = soilAnalyzedEventSchema.safeParse({ ...validSoilAnalyzed, ph: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects moisture above 100', () => {
    const result = soilAnalyzedEventSchema.safeParse({ ...validSoilAnalyzed, moisture: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects negative nitrogen', () => {
    const result = soilAnalyzedEventSchema.safeParse({ ...validSoilAnalyzed, nitrogen: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects missing soilDataId', () => {
    const { soilDataId: _, ...rest } = validSoilAnalyzed;
    expect(soilAnalyzedEventSchema.safeParse(rest).success).toBe(false);
  });
});
