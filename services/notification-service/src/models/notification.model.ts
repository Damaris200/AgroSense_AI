import { z } from 'zod';

export const recommendationGeneratedEventSchema = z.object({
  farmId:         z.string().uuid(),
  userId:         z.string().uuid(),
  userEmail:      z.string().email(),
  userName:       z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
  generatedAt:    z.string().datetime(),
});

export type RecommendationGeneratedEvent = z.infer<typeof recommendationGeneratedEventSchema>;

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}
