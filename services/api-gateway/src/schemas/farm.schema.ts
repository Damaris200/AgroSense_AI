import { z } from 'zod';

export const farmSubmissionSchema = z
  .object({
    name: z.string().trim().min(2, 'name must be at least 2 characters').optional(),
    cropType: z.string().min(2, 'cropType must be at least 2 characters'),
    location: z.string().min(2, 'location must be at least 2 characters'),
    gpsLat: z.coerce.number({ invalid_type_error: 'gpsLat must be a number' }).min(-90).max(90),
    gpsLng: z.coerce.number({ invalid_type_error: 'gpsLng must be a number' }).min(-180).max(180),
    soilColor:    z.enum(['red','brown','black','grey','yellow']),
    soilTexture:  z.enum(['sandy','loamy','clayey','silty']),
    soilMoisture: z.enum(['dry','moist','wet']),
  })
  .strict();

export type FarmSubmissionDto = z.infer<typeof farmSubmissionSchema>;
