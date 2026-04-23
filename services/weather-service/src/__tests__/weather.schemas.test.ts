import { describe, it, expect } from 'bun:test';
import {
  farmSavedEventSchema,
  openWeatherResponseSchema,
  weatherFetchedEventSchema,
} from '../models/weather.model';

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

describe('farmSavedEventSchema (weather-service)', () => {
  it('accepts a valid farm.saved payload', () => {
    expect(farmSavedEventSchema.safeParse(validFarmSaved).success).toBe(true);
  });

  it('rejects latitude outside valid range', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, gpsLat: -91 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude outside valid range', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, gpsLng: 181 });
    expect(result.success).toBe(false);
  });

  it('rejects empty location', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, location: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing gpsLat', () => {
    const { gpsLat: _, ...rest } = validFarmSaved;
    expect(farmSavedEventSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects non-uuid submissionId', () => {
    const result = farmSavedEventSchema.safeParse({ ...validFarmSaved, submissionId: 'bad' });
    expect(result.success).toBe(false);
  });
});

// ── openWeatherResponseSchema ─────────────────────────────────────────────────

const validApiResponse = {
  main:    { temp: 28.5, humidity: 72 },
  wind:    { speed: 4.2 },
  weather: [{ description: 'scattered clouds' }],
};

describe('openWeatherResponseSchema', () => {
  it('accepts a valid OpenWeather API response', () => {
    expect(openWeatherResponseSchema.safeParse(validApiResponse).success).toBe(true);
  });

  it('accepts a response with optional rain field', () => {
    const result = openWeatherResponseSchema.safeParse({ ...validApiResponse, rain: { '1h': 2.3 } });
    expect(result.success).toBe(true);
  });

  it('rejects missing main.temp', () => {
    const result = openWeatherResponseSchema.safeParse({
      ...validApiResponse,
      main: { humidity: 72 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty weather array', () => {
    const result = openWeatherResponseSchema.safeParse({ ...validApiResponse, weather: [] });
    expect(result.success).toBe(false);
  });
});

// ── weatherFetchedEventSchema ─────────────────────────────────────────────────

const validWeatherFetched = {
  submissionId:  '11111111-1111-4111-8111-111111111111',
  farmId:        '22222222-2222-4222-8222-222222222222',
  userId:        '33333333-3333-4333-8333-333333333333',
  weatherDataId: '55555555-5555-4555-8555-555555555555',
  temperature:   28.5,
  humidity:      72,
  rainfall:      2.3,
  windSpeed:     4.2,
  description:   'scattered clouds',
  fetchedAt:     '2026-04-21T10:02:00.000Z',
};

describe('weatherFetchedEventSchema', () => {
  it('accepts a valid weather.fetched payload', () => {
    expect(weatherFetchedEventSchema.safeParse(validWeatherFetched).success).toBe(true);
  });

  it('rejects humidity above 100', () => {
    const result = weatherFetchedEventSchema.safeParse({ ...validWeatherFetched, humidity: 110 });
    expect(result.success).toBe(false);
  });

  it('rejects negative rainfall', () => {
    const result = weatherFetchedEventSchema.safeParse({ ...validWeatherFetched, rainfall: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative windSpeed', () => {
    const result = weatherFetchedEventSchema.safeParse({ ...validWeatherFetched, windSpeed: -0.1 });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const { description: _, ...rest } = validWeatherFetched;
    expect(weatherFetchedEventSchema.safeParse(rest).success).toBe(false);
  });
});
