import axios from 'axios';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import type { WeatherSnapshot } from '@prisma/client';

export interface WeatherData {
  temperature: number;    // °C
  humidity: number;       // %
  rainfall: number;       // mm (last 1h)
  windSpeed: number;      // m/s
  condition: string;
  description: string;
  fetchedAt: string;
}

interface OWMResponse {
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: Array<{ main: string; description: string }>;
  rain?: { '1h'?: number };
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!env.openWeatherApiKey) {
    throw Object.assign(new Error('OpenWeatherMap API key not configured'), { statusCode: 503 });
  }

  const { data } = await axios.get<OWMResponse>(
    'https://api.openweathermap.org/data/2.5/weather',
    { params: { lat, lon, appid: env.openWeatherApiKey, units: 'metric' }, timeout: 8_000 },
  );

  return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
    rainfall: data.rain?.['1h'] ?? 0,
    windSpeed: data.wind.speed,
    condition: data.weather[0]?.main ?? 'Unknown',
    description: data.weather[0]?.description ?? '',
    fetchedAt: new Date().toISOString(),
  };
}

/** Fetch weather and persist a snapshot row for the farm. */
export async function fetchAndSaveWeather(farmId: string, lat: number, lon: number): Promise<WeatherData> {
  const weather = await getCurrentWeather(lat, lon);

  prisma.weatherSnapshot.create({
    data: {
      farmId,
      temperatureC: weather.temperature,
      humidityPct: weather.humidity,
      rainfallMm: weather.rainfall,
      windKph: weather.windSpeed * 3.6,   // m/s → km/h
      condition: weather.condition,
    },
  }).catch((err) => console.error('Failed to save weather snapshot:', err));

  return weather;
}

export async function getWeatherHistory(farmId: string): Promise<WeatherSnapshot[]> {
  return prisma.weatherSnapshot.findMany({
    where: { farmId },
    orderBy: { fetchedAt: 'desc' },
    take: 24,
  });
}
