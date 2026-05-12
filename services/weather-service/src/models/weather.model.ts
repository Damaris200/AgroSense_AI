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

export const tomorrowResponseSchema = z.object({
  data: z.object({
    time: z.string(),
    values: z.object({
      temperature:            z.number(),
      humidity:               z.number(),
      precipitationIntensity: z.number().default(0),
      windSpeed:              z.number().default(0),
      weatherCode:            z.number(),
    }),
  }),
  location: z.object({
    lat:  z.number(),
    lon:  z.number(),
    name: z.string().optional(),
  }),
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

export type FarmSavedEvent     = z.infer<typeof farmSavedEventSchema>;
export type TomorrowResponse   = z.infer<typeof tomorrowResponseSchema>;
export type WeatherFetchedEvent = z.infer<typeof weatherFetchedEventSchema>;