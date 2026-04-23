import { describe, it, expect } from 'bun:test';
import { parseOpenWeatherResponse, buildWeatherFetchedEvent } from '../services/weather.service';

// ── parseOpenWeatherResponse ──────────────────────────────────────────────────

describe('parseOpenWeatherResponse', () => {
  const apiResponse = {
    main:    { temp: 28.5, humidity: 72 },
    wind:    { speed: 4.2 },
    weather: [{ description: 'light rain' }],
    rain:    { '1h': 3.0 },
  };

  it('extracts temperature from main.temp', () => {
    const result = parseOpenWeatherResponse(apiResponse);
    expect(result.temperature).toBe(28.5);
  });

  it('extracts humidity from main.humidity', () => {
    const result = parseOpenWeatherResponse(apiResponse);
    expect(result.humidity).toBe(72);
  });

  it('extracts rainfall from rain["1h"]', () => {
    const result = parseOpenWeatherResponse(apiResponse);
    expect(result.rainfall).toBe(3.0);
  });

  it('defaults rainfall to 0 when rain field is absent', () => {
    const { rain: _, ...noRain } = apiResponse;
    const result = parseOpenWeatherResponse(noRain);
    expect(result.rainfall).toBe(0);
  });

  it('extracts wind speed from wind.speed', () => {
    const result = parseOpenWeatherResponse(apiResponse);
    expect(result.windSpeed).toBe(4.2);
  });

  it('extracts description from first weather entry', () => {
    const result = parseOpenWeatherResponse(apiResponse);
    expect(result.description).toBe('light rain');
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
});
