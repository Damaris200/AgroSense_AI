import { api } from './auth.service';
import type { ApiEnvelope } from './auth.service';

export interface WeatherRecord {
  id:          string;
  farmId:      string;
  temperature: number;
  humidity:    number;
  rainfall:    number;
  windSpeed:   number;
  description: string;
  fetchedAt:   string;
}

export async function getWeatherForFarm(farmId: string): Promise<WeatherRecord[]> {
  const res = await api.get<ApiEnvelope<WeatherRecord[]>>('/api/weather', {
    params: { farmId },
  });
  return res.data.data;
}
