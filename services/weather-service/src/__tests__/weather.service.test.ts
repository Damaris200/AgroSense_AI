import { describe, it, expect } from 'bun:test';
import { parseTomorrowResponse, buildWeatherFetchedEvent } from '../services/weather.service';
import type { TomorrowResponse } from '../models/weather.model';

// ── parseTomorrowResponse ─────────────────────────────────────────────────────

describe('parseTomorrowResponse', () => {
  const raw: TomorrowResponse = {
    data: {
      time: '2026-04-21T10:00:00Z',
      values: {
        temperature:            28.5,
        humidity:               72,
        precipitationIntensity: 3.0,
        windSpeed:              4.2,
        weatherCode:            4200,
      },
    },
    location: { lat: 6.4541, lon: 7.5087 },
  };

  it('extracts temperature', () => {
    expect(parseTomorrowResponse(raw).temperature).toBe(28.5);
  });

  it('extracts humidity clamped to [0, 100]', () => {
    expect(parseTomorrowResponse(raw).humidity).toBe(72);
  });

  it('clamps humidity above 100 to 100', () => {
    const over = { ...raw, data: { ...raw.data, values: { ...raw.data.values, humidity: 110 } } };
    expect(parseTomorrowResponse(over).humidity).toBe(100);
  });

  it('clamps humidity below 0 to 0', () => {
    const under = { ...raw, data: { ...raw.data, values: { ...raw.data.values, humidity: -5 } } };
    expect(parseTomorrowResponse(under).humidity).toBe(0);
  });

  it('extracts rainfall from precipitationIntensity', () => {
    expect(parseTomorrowResponse(raw).rainfall).toBe(3.0);
  });

  it('extracts windSpeed', () => {
    expect(parseTomorrowResponse(raw).windSpeed).toBe(4.2);
  });

  it('maps weatherCode 4200 to "light rain"', () => {
    expect(parseTomorrowResponse(raw).description).toBe('light rain');
  });

  it('defaults description to "unknown" for unrecognised weatherCode', () => {
    const unknown = { ...raw, data: { ...raw.data, values: { ...raw.data.values, weatherCode: 9999 } } };
    expect(parseTomorrowResponse(unknown).description).toBe('unknown');
  });

  it('maps weatherCode 1000 to "clear, sunny"', () => {
    const sunny = { ...raw, data: { ...raw.data, values: { ...raw.data.values, weatherCode: 1000 } } };
    expect(parseTomorrowResponse(sunny).description).toBe('clear, sunny');
  });
});

// ── buildWeatherFetchedEvent ──────────────────────────────────────────────────

describe('buildWeatherFetchedEvent', () => {
  const farmEvent = {
    submissionId: '11111111-1111-4111-8111-111111111111',
    farmId:       '22222222-2222-4222-8222-222222222222',
    userId:       '33333333-3333-4333-8333-333333333333',
    name:         'Okoro Farm',
    location:     'Enugu',
    cropType:     'maize',
    gpsLat:       6.4541,
    gpsLng:       7.5087,
    savedAt:      '2026-04-21T10:00:00.000Z',
  };

  const weatherRecord = {
    id:          '55555555-5555-4555-8555-555555555555',
    farmId:      '22222222-2222-4222-8222-222222222222',
    temperature: 28.5,
    humidity:    72,
    rainfall:    3.0,
    windSpeed:   4.2,
    description: 'light rain',
    fetchedAt:   new Date('2026-04-21T10:02:00.000Z'),
  };

  it('includes all required event fields', () => {
    const event = buildWeatherFetchedEvent(farmEvent, weatherRecord);
    expect(event).toHaveProperty('submissionId', farmEvent.submissionId);
    expect(event).toHaveProperty('farmId', farmEvent.farmId);
    expect(event).toHaveProperty('userId', farmEvent.userId);
    expect(event).toHaveProperty('weatherDataId', weatherRecord.id);
    expect(event).toHaveProperty('temperature', weatherRecord.temperature);
    expect(event).toHaveProperty('humidity', weatherRecord.humidity);
    expect(event).toHaveProperty('rainfall', weatherRecord.rainfall);
    expect(event).toHaveProperty('windSpeed', weatherRecord.windSpeed);
    expect(event).toHaveProperty('description', weatherRecord.description);
    expect(event).toHaveProperty('fetchedAt');
  });

  it('preserves submissionId for orchestrator correlation', () => {
    const event = buildWeatherFetchedEvent(farmEvent, weatherRecord);
    expect(event.submissionId).toBe(farmEvent.submissionId);
  });

  it('defaults userEmail and userName to empty string when absent', () => {
    const event = buildWeatherFetchedEvent(farmEvent, weatherRecord);
    expect(event.userEmail).toBe('');
    expect(event.userName).toBe('');
  });
});
