import { z } from 'zod';

export const recommendationGeneratedEventSchema = z.object({
  submissionId:   z.string().uuid(),
  farmId:         z.string().uuid(),
  userId:         z.union([z.string().uuid(), z.literal('anonymous')]),
  userEmail:      z.string().optional().default(''),
  userName:       z.string().optional().default(''),
  cropType:       z.string().optional().default(''),
  location:       z.string().optional().default(''),
  recommendation: z.string().trim().min(1),
  model:          z.string().optional().default(''),
  generatedAt:    z.string().datetime(),
});

export type RecommendationGeneratedEvent = z.infer<typeof recommendationGeneratedEventSchema>;

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}
