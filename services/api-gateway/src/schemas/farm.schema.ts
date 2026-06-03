import { z } from 'zod';

/**
 * Validates the body of an incoming farm submission request.
 * Use with validateBody(farmSubmissionSchema) in route handlers.
 *
 * .strict() rejects any unknown fields, keeping the gateway surface minimal.
 */
export const farmSubmissionSchema = z
  .object({
    name: z.string().trim().min(2, 'name must be at least 2 characters').optional(),
    cropType: z.string().min(2, 'cropType must be at least 2 characters'),
    location: z.string().min(2, 'location must be at least 2 characters'),
    gpsLat: z
      .coerce.number({ invalid_type_error: 'gpsLat must be a number' })
      .min(-90, 'gpsLat must be ≥ -90')
      .max(90, 'gpsLat must be ≤ 90'),
    gpsLng: z
      .coerce.number({ invalid_type_error: 'gpsLng must be a number' })
      .min(-180, 'gpsLng must be ≥ -180')
      .max(180, 'gpsLng must be ≤ 180'),
  })
  .strict();

export type FarmSubmissionDto = z.infer<typeof farmSubmissionSchema>;
