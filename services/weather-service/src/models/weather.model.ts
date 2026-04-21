import { z } from 'zod';

export const farmSavedEventSchema = z.object({
  submissionId: z.string().uuid(),
  farmId:       z.string().uuid(),
  userId:       z.string().uuid(),
  name:         z.string(),
  location:     z.string(),
  cropType:     z.string(),
  gpsLat:       z.number(),
  gpsLng:       z.number(),
  savedAt:      z.string().datetime(),
});

export const openWeatherResponseSchema = z.object({
  main: z.object({
    temp:     z.number(),
    humidity: z.number(),
  }),
  wind: z.object({
    speed: z.number(),
  }),
  rain:    z.object({ '1h': z.number().optional() }).optional(),
  weather: z.array(z.object({ description: z.string() })).min(1),
});

export const weatherFetchedEventSchema = z.object({
  submissionId:  z.string().uuid(),
  farmId:        z.string().uuid(),
  userId:        z.string().uuid(),
  weatherDataId: z.string().uuid(),
  temperature:   z.number(),
  humidity:      z.number().min(0).max(100),
  rainfall:      z.number().min(0),
  windSpeed:     z.number().min(0),
  description:   z.string(),
  fetchedAt:     z.string().datetime(),
});

export type FarmSavedEvent        = z.infer<typeof farmSavedEventSchema>;
export type OpenWeatherResponse   = z.infer<typeof openWeatherResponseSchema>;
export type WeatherFetchedEvent   = z.infer<typeof weatherFetchedEventSchema>;
