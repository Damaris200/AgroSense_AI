import { z } from "zod";

export const farmSubmittedEventSchema = z.object({
  submissionId: z.string().uuid(),
  userId:       z.string().optional().default("anonymous"),
  cropType:     z.string().min(1),
  location:     z.string().min(1),
  gpsLat:       z.number().min(-90).max(90),
  gpsLng:       z.number().min(-180).max(180),
  submittedAt:  z.string(),
});

export type FarmSubmittedEvent = z.infer<typeof farmSubmittedEventSchema>;

export interface FarmSavedEvent {
  submissionId: string;
  farmId:       string;
  userId:       string;
  cropType:     string;
  location:     string;
  gpsLat:       number;
  gpsLng:       number;
  savedAt:      string;
}