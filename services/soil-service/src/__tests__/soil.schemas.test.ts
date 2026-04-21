import { describe, it, expect } from 'bun:test';
import { farmSavedEventSchema, soilAnalyzedEventSchema } from '../models/soil.model';

const validFarmSaved = {
  submissionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  farmId:       'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  userId:       'c3d4e5f6-a7b8-9012-cdef-012345678912',
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
  submissionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  farmId:       'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  userId:       'c3d4e5f6-a7b8-9012-cdef-012345678912',
  soilDataId:   'd4e5f6a7-b8c9-0123-def0-123456789123',
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
