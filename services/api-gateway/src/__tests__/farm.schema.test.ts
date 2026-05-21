import { describe, it, expect } from 'bun:test';
import { farmSubmissionSchema } from '../schemas/farm.schema';

const VALID = {
  cropType: 'maize',
  location: 'Yaounde, Cameroon',
  gpsLat:   3.848,
  gpsLng:   11.502,
};

describe('farmSubmissionSchema', () => {
  it('accepts a valid farm submission payload', () => {
    const result = farmSubmissionSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('rejects cropType shorter than 2 characters', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, cropType: 'a' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('cropType');
  });

  it('rejects location shorter than 2 characters', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, location: 'Y' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('location');
  });

  it('rejects gpsLat above 90', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLat: 91 });
    expect(result.success).toBe(false);
  });

  it('rejects gpsLat below -90', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLat: -91 });
    expect(result.success).toBe(false);
  });

  it('rejects gpsLng above 180', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLng: 181 });
    expect(result.success).toBe(false);
  });

  it('rejects gpsLng below -180', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLng: -181 });
    expect(result.success).toBe(false);
  });

  it('accepts boundary values: gpsLat=90, gpsLng=180', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLat: 90, gpsLng: 180 });
    expect(result.success).toBe(true);
  });

  it('accepts boundary values: gpsLat=-90, gpsLng=-180', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLat: -90, gpsLng: -180 });
    expect(result.success).toBe(true);
  });

  it('rejects non-number gpsLat (strict mode)', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, gpsLat: 'three' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown extra fields (strict mode)', () => {
    const result = farmSubmissionSchema.safeParse({ ...VALID, extraField: 'oops' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty object', () => {
    const result = farmSubmissionSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.issues.length).toBeGreaterThan(0);
  });

  it('rejects missing gpsLat', () => {
    const { gpsLat: _, ...rest } = VALID;
    expect(farmSubmissionSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing gpsLng', () => {
    const { gpsLng: _, ...rest } = VALID;
    expect(farmSubmissionSchema.safeParse(rest).success).toBe(false);
  });
});
