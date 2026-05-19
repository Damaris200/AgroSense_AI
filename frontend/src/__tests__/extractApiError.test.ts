import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { extractApiError } from '../services/auth.service';

describe('extractApiError', () => {
  it('returns fallback for a plain string', () => {
    expect(extractApiError('some string', 'fallback')).toBe('fallback');
  });

  it('returns fallback for null', () => {
    expect(extractApiError(null, 'fallback')).toBe('fallback');
  });

  it('returns fallback for undefined', () => {
    expect(extractApiError(undefined, 'fallback')).toBe('fallback');
  });

  it('returns fallback for a number', () => {
    expect(extractApiError(42, 'fallback')).toBe('fallback');
  });

  it('returns error.message for a plain Error', () => {
    expect(extractApiError(new Error('something broke'), 'fallback')).toBe('something broke');
  });

  it('extracts the error field from an Axios response body', () => {
    const err = new axios.AxiosError('Request failed');
    Object.defineProperty(err, 'response', {
      value: {
        data: { error: 'Email already registered.' },
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: { headers: {} as never },
      },
      writable: true,
    });
    expect(extractApiError(err, 'fallback')).toBe('Email already registered.');
  });

  it('falls back to axios.message when response has no error field', () => {
    const err = new axios.AxiosError('Network Error');
    expect(extractApiError(err, 'fallback')).toBe('Network Error');
  });

  it('returns fallback when axios error has no message and no response', () => {
    const err = new axios.AxiosError();
    err.message = '';
    expect(extractApiError(err, 'use this fallback')).toBe('use this fallback');
  });
});
