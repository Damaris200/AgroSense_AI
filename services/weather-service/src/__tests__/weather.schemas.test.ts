import { describe, it, expect } from 'bun:test';
import {
  farmSavedEventSchema,
  openWeatherResponseSchema,
  weatherFetchedEventSchema,
} from '../models/weather.model';

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

describe('farmSavedEventSchema (weather-service)', () => {
  it('accepts a valid farm.saved payload', () => {
    expect(farmSavedEventSchema.safeParse(validFarmSaved).success).toBe(true);
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
  submissionId:  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  farmId:        'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  userId:        'c3d4e5f6-a7b8-9012-cdef-012345678912',
  weatherDataId: 'e5f6a7b8-c9d0-1234-ef01-234567890123',
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
