import { tomorrowResponseSchema } from '../models/weather.model';
import type { FarmSavedEvent, TomorrowResponse, WeatherFetchedEvent } from '../models/weather.model';
import { env } from '../config/env';

// Tomorrow.io weather code → human-readable description
const WEATHER_CODE_MAP: Record<number, string> = {
  1000: 'clear, sunny',
  1100: 'mostly clear',
  1101: 'partly cloudy',
  1102: 'mostly cloudy',
  1001: 'cloudy',
  2000: 'fog',
  2100: 'light fog',
  4000: 'drizzle',
  4001: 'rain',
  4200: 'light rain',
  4201: 'heavy rain',
  5000: 'snow',
  5001: 'flurries',
  5100: 'light snow',
  5101: 'heavy snow',
  6000: 'freezing drizzle',
  6001: 'freezing rain',
  6200: 'light freezing rain',
  6201: 'heavy freezing rain',
  7000: 'ice pellets',
  7101: 'heavy ice pellets',
  7102: 'light ice pellets',
  8000: 'thunderstorm',
};

interface ParsedWeather {
  temperature: number;
  humidity:    number;
  rainfall:    number;
  windSpeed:   number;
  description: string;
}

function parseTomorrowResponse(raw: TomorrowResponse): ParsedWeather {
  const v = raw.data.values;
  return {
    temperature: v.temperature,
    humidity:    Math.min(100, Math.max(0, v.humidity)),
    rainfall:    v.precipitationIntensity,
    windSpeed:   v.windSpeed,
    description: WEATHER_CODE_MAP[v.weatherCode] ?? 'unknown',
  };
}

async function fetchFromTomorrow(lat: number, lng: number): Promise<ParsedWeather> {
  const url =
    `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lng}&apikey=${env.tomorrowApiKey}&units=metric`;

  const res = await fetch(url, {
    headers: { accept: 'application/json' },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Tomorrow.io API error: ${res.status} ${res.statusText} — ${body}`);
  }

  const json = await res.json();
  const parsed = tomorrowResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Unexpected Tomorrow.io response shape: ${JSON.stringify(parsed.error.flatten())}`);
  }

  return parseTomorrowResponse(parsed.data);
}

export function buildWeatherFetchedEvent(
  farmEvent: FarmSavedEvent,
  record: { id: string; temperature: number; humidity: number; rainfall: number; windSpeed: number; description: string; fetchedAt: Date },
): WeatherFetchedEvent {
  return {
    submissionId:  farmEvent.submissionId,
    farmId:        farmEvent.farmId,
    userId:        farmEvent.userId,
    userEmail:     farmEvent.userEmail ?? '',
    userName:      farmEvent.userName ?? '',
    weatherDataId: record.id,
    temperature:   record.temperature,
    humidity:      record.humidity,
    rainfall:      record.rainfall,
    windSpeed:     record.windSpeed,
    description:   record.description,
    fetchedAt:     record.fetchedAt.toISOString(),
  };
}

export async function processFarmSaved(event: FarmSavedEvent): Promise<WeatherFetchedEvent> {
  const { prisma } = await import('../config/prisma');
  const weather = await fetchFromTomorrow(event.gpsLat, event.gpsLng);

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