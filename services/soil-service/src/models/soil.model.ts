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

export const soilAnalyzedEventSchema = z.object({
  submissionId: z.string().uuid(),
  farmId:       z.string().uuid(),
  userId:       z.union([z.string().uuid(), z.literal('anonymous')]),
  userEmail:    z.string().optional().default(''),
  userName:     z.string().optional().default(''),
  soilDataId:   z.string().uuid(),
  ph:           z.number().min(0).max(14),
  moisture:     z.number().min(0).max(100),
  nitrogen:     z.number().min(0),
  phosphorus:   z.number().min(0),
  potassium:    z.number().min(0),
  analyzedAt:   z.string().datetime(),
});

export type FarmSavedEvent    = z.infer<typeof farmSavedEventSchema>;
export type SoilAnalyzedEvent = z.infer<typeof soilAnalyzedEventSchema>;
