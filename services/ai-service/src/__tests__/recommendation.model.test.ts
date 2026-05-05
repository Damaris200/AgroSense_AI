import { describe, it, expect } from 'bun:test';
import type { AnalysisReadyEvent, RecommendationGeneratedEvent } from '../models/recommendation.model';

describe('AnalysisReadyEvent shape', () => {
  const validEvent: AnalysisReadyEvent = {
    submissionId: '11111111-1111-4111-8111-111111111111',
    farmId: '22222222-2222-4222-8222-222222222222',
    cropType: 'maize',
    location: 'Yaounde, Cameroon',
    gpsLat: 3.848,
    gpsLng: 11.502,
    weather: {
      temperature: 28,
      humidity: 75,
      rainfall: 12,
      description: 'partly cloudy',
    },
    soil: {
      pH: 6.2,
      moisture: 45,
      nitrogen: 120,
      phosphorus: 35,
      potassium: 180,
    },
    readyAt: new Date().toISOString(),
  };

  it('has all required weather fields', () => {
    expect(validEvent.weather).toHaveProperty('temperature');
    expect(validEvent.weather).toHaveProperty('humidity');
    expect(validEvent.weather).toHaveProperty('rainfall');
    expect(validEvent.weather).toHaveProperty('description');
  });

  it('has all required soil fields', () => {
    expect(validEvent.soil).toHaveProperty('pH');
    expect(validEvent.soil).toHaveProperty('moisture');
    expect(validEvent.soil).toHaveProperty('nitrogen');
    expect(validEvent.soil).toHaveProperty('phosphorus');
    expect(validEvent.soil).toHaveProperty('potassium');
  });

  it('has correct submissionId and farmId', () => {
    expect(validEvent.submissionId).toBe('11111111-1111-4111-8111-111111111111');
    expect(validEvent.farmId).toBe('22222222-2222-4222-8222-222222222222');
  });
});

describe('RecommendationGeneratedEvent shape', () => {
  const validEvent: RecommendationGeneratedEvent = {
    submissionId: '11111111-1111-4111-8111-111111111111',
    farmId: '22222222-2222-4222-8222-222222222222',
    cropType: 'maize',
    location: 'Yaounde, Cameroon',
    recommendation: 'Current conditions are favorable for maize cultivation.',
    model: 'gpt-4.1-mini',
    generatedAt: new Date().toISOString(),
  };

  it('has a non-empty recommendation', () => {
    expect(validEvent.recommendation.length).toBeGreaterThan(0);
  });

  it('has a model name', () => {
    expect(validEvent.model).toBe('gpt-4.1-mini');
  });

  it('links back to the correct submissionId', () => {
    expect(validEvent.submissionId).toBe('11111111-1111-4111-8111-111111111111');
  });
});