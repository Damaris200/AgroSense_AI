import { z } from 'zod';

export const farmSavedEventSchema = z.object({
  submissionId: z.string().uuid(),
  farmId:       z.string().uuid(),
  userId:       z.union([z.string().uuid(), z.literal('anonymous')]),
  userEmail:    z.string().optional().default(''),
  userName:     z.string().optional().default(''),
  name:         z.string().optional(),
  location:     z.string().trim().min(1),
  cropType:     z.string().trim().min(1),
  gpsLat:       z.number().min(-90).max(90),
  gpsLng:       z.number().min(-180).max(180),
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
  userId:        z.union([z.string().uuid(), z.literal('anonymous')]),
  userEmail:     z.string().optional().default(''),
  userName:      z.string().optional().default(''),
  weatherDataId: z.string().uuid(),
  temperature:   z.number(),
  humidity:      z.number().min(0).max(100),
  rainfall:      z.number().min(0),
  windSpeed:     z.number().min(0),
  description:   z.string(),
  fetchedAt:     z.string().datetime(),
});

export type FarmSavedEvent      = z.infer<typeof farmSavedEventSchema>;
export type OpenWeatherResponse = z.infer<typeof openWeatherResponseSchema>;
export type WeatherFetchedEvent = z.infer<typeof weatherFetchedEventSchema>;
