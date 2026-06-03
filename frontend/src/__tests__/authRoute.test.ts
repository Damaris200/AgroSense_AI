import { describe, expect, it } from 'vitest';

import { getPostLoginRoute } from '@/utils/authRoute';

describe('getPostLoginRoute', () => {
  it('routes admins to admin dashboard', () => {
    expect(getPostLoginRoute('admin')).toBe('/admin');
  });

  it('routes farmers and agronomists to farmer dashboard', () => {
    expect(getPostLoginRoute('farmer')).toBe('/dashboard');
    expect(getPostLoginRoute('agronomist')).toBe('/dashboard');
  });

  it('falls back to farmer dashboard for unknown state', () => {
    expect(getPostLoginRoute(undefined)).toBe('/dashboard');
  });
});
