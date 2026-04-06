/**
 * Unit tests for the rule-based recommendation logic.
 * No database or network calls required — Prisma client is mocked.
 */
import { describe, it, expect, mock } from 'bun:test';

// Mock Prisma so no DB connection is needed
mock.module('../config/prisma', () => ({
  prisma: {
    recommendation: {
      upsert: async (_args: unknown) => ({
        id: 'rec-1',
        farmId: 'farm-1',
        observationId: null,
        eventId: 'evt-1',
        action: 'plant',
        urgency: 'low',
        message: 'Good time to plant.',
        source: 'rule',
        contextJson: {},
        reviewedById: null,
        reviewStatus: 'pending',
        createdAt: new Date(),
      }),
    },
  },
}));

mock.module('../config/env', () => ({
  env: {
    port: 4000, nodeEnv: 'test', databaseUrl: '', redisUrl: '',
    jwtSecret: 'test', jwtExpiresIn: '1h', corsOrigin: '*',
    openWeatherApiKey: undefined, geminiApiKey: undefined,
  },
}));

import { generateRecommendation } from '../services/recommendation.service';
import type { WeatherData } from '../services/weather.service';

function mockWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return { temperature: 22, humidity: 65, rainfall: 0, windSpeed: 3, condition: 'Clear', description: 'clear sky', fetchedAt: new Date().toISOString(), ...overrides };
}

describe('Rule-based recommendation engine', () => {
  it('recommends protect_frost when temperature < 5°C', async () => {
    const rec = await generateRecommendation('farm-1', 'user-1', mockWeather({ temperature: 2 }));
    expect(rec.action).toBe('protect_frost');
    expect(rec.source).toBe('rule');
  });

  it('recommends irrigate when humidity < 30% and no rain', async () => {
    const rec = await generateRecommendation('farm-1', 'user-1', mockWeather({ humidity: 20, rainfall: 0 }));
    expect(rec.action).toBe('irrigate');
    expect(rec.source).toBe('rule');
  });

  it('recommends harvest on heavy rainfall > 20mm', async () => {
    const rec = await generateRecommendation('farm-1', 'user-1', mockWeather({ rainfall: 25 }));
    expect(rec.action).toBe('harvest');
    expect(rec.source).toBe('rule');
  });

  it('recommends plant under optimal conditions', async () => {
    const rec = await generateRecommendation('farm-1', 'user-1', mockWeather({ temperature: 23, humidity: 70, rainfall: 0 }));
    expect(rec.action).toBe('plant');
    expect(rec.source).toBe('rule');
  });

  it('urgency is low | medium | high', async () => {
    const rec = await generateRecommendation('farm-1', 'user-1', mockWeather());
    expect(['low', 'medium', 'high']).toContain(rec.urgency);
  });
});
