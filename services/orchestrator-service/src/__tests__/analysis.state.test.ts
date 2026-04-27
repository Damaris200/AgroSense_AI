import { describe, it, expect, beforeEach } from 'bun:test';
import {
  initState,
  setWeather,
  setSoil,
  isReady,
  getState,
  clearState,
} from '../state/analysis.state';

const BASE = {
  farmId: '22222222-2222-4222-8222-222222222222',
  submissionId: '11111111-1111-4111-8111-111111111111',
  cropType: 'maize',
  location: 'Yaounde',
  gpsLat: 3.848,
  gpsLng: 11.502,
};

const WEATHER = {
  temperature: 28,
  humidity: 75,
  rainfall: 12,
  description: 'partly cloudy',
};

const SOIL = {
  pH: 6.2,
  moisture: 45,
  nitrogen: 120,
  phosphorus: 35,
  potassium: 180,
};

describe('analysis.state', () => {
  beforeEach(() => {
    clearState(BASE.submissionId);
  });

  it('initializes state for a new submission', () => {
    initState(BASE.submissionId, BASE);
    const state = getState(BASE.submissionId);
    expect(state).toBeDefined();
    expect(state?.farmId).toBe(BASE.farmId);
  });

  it('is not ready when only weather is set', () => {
    initState(BASE.submissionId, BASE);
    setWeather(BASE.submissionId, WEATHER);
    expect(isReady(BASE.submissionId)).toBe(false);
  });

  it('is not ready when only soil is set', () => {
    initState(BASE.submissionId, BASE);
    setSoil(BASE.submissionId, SOIL);
    expect(isReady(BASE.submissionId)).toBe(false);
  });

  it('is ready when both weather and soil are set', () => {
    initState(BASE.submissionId, BASE);
    setWeather(BASE.submissionId, WEATHER);
    setSoil(BASE.submissionId, SOIL);
    expect(isReady(BASE.submissionId)).toBe(true);
  });

  it('clears state after processing', () => {
    initState(BASE.submissionId, BASE);
    clearState(BASE.submissionId);
    expect(getState(BASE.submissionId)).toBeUndefined();
  });

  it('does not overwrite existing state on second init', () => {
    initState(BASE.submissionId, BASE);
    setWeather(BASE.submissionId, WEATHER);
    initState(BASE.submissionId, { ...BASE, cropType: 'rice' });
    const state = getState(BASE.submissionId);
    expect(state?.cropType).toBe('maize');
  });
});