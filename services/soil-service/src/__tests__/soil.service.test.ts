import { describe, it, expect } from 'bun:test';
import { deriveSoilData, buildSoilAnalyzedEvent } from '../services/soil.service';

// ── deriveSoilData ────────────────────────────────────────────────────────────
// Soil readings are now derived from the farmer's observations
// (colour / texture / moisture) instead of being randomly simulated.

describe('deriveSoilData', () => {
  it('returns all required nutrient fields', () => {
    const data = deriveSoilData('brown', 'loamy', 'moist');
    expect(data).toHaveProperty('ph');
    expect(data).toHaveProperty('moisture');
    expect(data).toHaveProperty('nitrogen');
    expect(data).toHaveProperty('phosphorus');
    expect(data).toHaveProperty('potassium');
  });

  it('returns pH within valid range (0–14) for every colour/texture', () => {
    const colors = ['red', 'brown', 'black', 'grey', 'yellow'];
    const textures = ['sandy', 'loamy', 'clayey', 'silty'];
    for (const c of colors) {
      for (const t of textures) {
        const { ph } = deriveSoilData(c, t, 'moist');
        expect(ph).toBeGreaterThanOrEqual(0);
        expect(ph).toBeLessThanOrEqual(14);
      }
    }
  });

  it('returns moisture within valid range (0–100)', () => {
    for (const m of ['dry', 'moist', 'wet']) {
      const { moisture } = deriveSoilData('brown', 'loamy', m);
      expect(moisture).toBeGreaterThanOrEqual(0);
      expect(moisture).toBeLessThanOrEqual(100);
    }
  });

  it('returns non-negative nutrient values', () => {
    const { nitrogen, phosphorus, potassium } = deriveSoilData('black', 'clayey', 'wet');
    expect(nitrogen).toBeGreaterThanOrEqual(0);
    expect(phosphorus).toBeGreaterThanOrEqual(0);
    expect(potassium).toBeGreaterThanOrEqual(0);
  });

  it('returns numbers rounded to 2 decimal places', () => {
    const data = deriveSoilData('brown', 'loamy', 'moist');
    const decimalPlaces = (n: number) => (n.toString().split('.')[1] ?? '').length;
    expect(decimalPlaces(data.ph)).toBeLessThanOrEqual(2);
    expect(decimalPlaces(data.moisture)).toBeLessThanOrEqual(2);
  });

  it('falls back to sensible defaults for unknown observations', () => {
    const data = deriveSoilData('unknown', 'unknown', 'unknown');
    expect(data.ph).toBeGreaterThan(0);
    expect(data.moisture).toBeGreaterThanOrEqual(0);
    expect(data.nitrogen).toBeGreaterThanOrEqual(0);
  });
});

// ── buildSoilAnalyzedEvent ────────────────────────────────────────────────────

describe('buildSoilAnalyzedEvent', () => {
  const soilData = {
    id: '44444444-4444-4444-8444-444444444444',
    farmId: '22222222-2222-4222-8222-222222222222',
    ph: 6.5,
    moisture: 45.2,
    nitrogen: 120.0,
    phosphorus: 40.5,
    potassium: 200.0,
    analyzedAt: new Date('2026-04-21T10:05:00.000Z'),
  };

  const farmEvent = {
    submissionId: '11111111-1111-4111-8111-111111111111',
    farmId:       '22222222-2222-4222-8222-222222222222',
    userId:       '33333333-3333-4333-8333-333333333333',
    userEmail:    '',
    userName:     '',
    name:         'Okoro Farm',
    location:     'Enugu, Nigeria',
    cropType:     'maize',
    gpsLat:       6.4541,
    gpsLng:       7.5087,
    soilColor:    'brown',
    soilTexture:  'loamy',
    soilMoisture: 'moist',
    savedAt:      '2026-04-21T10:00:00.000Z',
  };

  it('includes all required event fields', () => {
    const event = buildSoilAnalyzedEvent(farmEvent, soilData);
    expect(event).toHaveProperty('submissionId', farmEvent.submissionId);
    expect(event).toHaveProperty('farmId', farmEvent.farmId);
    expect(event).toHaveProperty('userId', farmEvent.userId);
    expect(event).toHaveProperty('soilDataId', soilData.id);
    expect(event).toHaveProperty('ph', soilData.ph);
    expect(event).toHaveProperty('moisture', soilData.moisture);
    expect(event).toHaveProperty('nitrogen', soilData.nitrogen);
    expect(event).toHaveProperty('phosphorus', soilData.phosphorus);
    expect(event).toHaveProperty('potassium', soilData.potassium);
    expect(event).toHaveProperty('analyzedAt');
  });

  it('preserves submissionId from the farm event for orchestrator correlation', () => {
    const event = buildSoilAnalyzedEvent(farmEvent, soilData);
    expect(event.submissionId).toBe(farmEvent.submissionId);
  });
});
