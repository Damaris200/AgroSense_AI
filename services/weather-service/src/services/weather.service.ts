import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { openWeatherResponseSchema } from '../models/weather.model';
import type { FarmSavedEvent, OpenWeatherResponse, WeatherFetchedEvent } from '../models/weather.model';

interface ParsedWeather {
  temperature: number;
  humidity:    number;
  rainfall:    number;
  windSpeed:   number;
  description: string;
}

export function parseOpenWeatherResponse(raw: OpenWeatherResponse): ParsedWeather {
  return {
    temperature: raw.main.temp,
    humidity:    raw.main.humidity,
    rainfall:    raw.rain?.['1h'] ?? 0,
    windSpeed:   raw.wind.speed,
    description: raw.weather[0]!.description,
  };
}

export function buildWeatherFetchedEvent(
  farmEvent: FarmSavedEvent,
  record: { id: string; temperature: number; humidity: number; rainfall: number; windSpeed: number; description: string; fetchedAt: Date },
): WeatherFetchedEvent {
  return {
    submissionId:  farmEvent.submissionId,
    farmId:        farmEvent.farmId,
    userId:        farmEvent.userId,
    weatherDataId: record.id,
    temperature:   record.temperature,
    humidity:      record.humidity,
    rainfall:      record.rainfall,
    windSpeed:     record.windSpeed,
    description:   record.description,
    fetchedAt:     record.fetchedAt.toISOString(),
  };
}

async function fetchFromOpenWeather(lat: number, lng: number): Promise<ParsedWeather> {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${env.openWeatherApiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenWeather API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const parsed = openWeatherResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Unexpected OpenWeather response shape: ${JSON.stringify(parsed.error.flatten())}`);
  }

  return parseOpenWeatherResponse(parsed.data);
}

export async function processFarmSaved(event: FarmSavedEvent): Promise<WeatherFetchedEvent> {
  const weather = await fetchFromOpenWeather(event.gpsLat, event.gpsLng);

  const record = await prisma.weatherData.create({
    data: {
      farmId:      event.farmId,
      temperature: weather.temperature,
      humidity:    weather.humidity,
      rainfall:    weather.rainfall,
      windSpeed:   weather.windSpeed,
      description: weather.description,
    },
  });

  return buildWeatherFetchedEvent(event, record);
}
