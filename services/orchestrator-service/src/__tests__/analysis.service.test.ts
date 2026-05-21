import { describe, it, expect, beforeEach } from 'bun:test';
import { buildAnalysisReadyPayload } from '../services/analysis.service';
import { initState, setWeather, setSoil, clearState } from '../state/analysis.state';

const SUBMISSION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FARM_ID       = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const BASE = {
  farmId:       FARM_ID,
  submissionId: SUBMISSION_ID,
  userId:       'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  userEmail:    'anya@farm.com',
  userName:     'Anya Okoro',
  cropType:     'maize',
  location:     'Yaounde, Cameroon',
  gpsLat:       3.848,
  gpsLng:       11.502,
};

const WEATHER = {
  temperature: 28,
  humidity:    75,
  rainfall:    12,
  windSpeed:   5,
  description: 'partly cloudy',
};

const SOIL = {
  pH:         6.2,
  moisture:   45,
  nitrogen:   120,
  phosphorus: 35,
  potassium:  180,
};

describe('buildAnalysisReadyPayload', () => {
  beforeEach(() => {
    clearState(SUBMISSION_ID);
  });

  it('returns null when state has not been initialized', () => {
    expect(buildAnalysisReadyPayload(SUBMISSION_ID)).toBeNull();
  });

  it('returns null when only weather is set (soil missing)', () => {
    initState(SUBMISSION_ID, BASE);
    setWeather(SUBMISSION_ID, WEATHER);
    expect(buildAnalysisReadyPayload(SUBMISSION_ID)).toBeNull();
  });

  it('returns null when only soil is set (weather missing)', () => {
    initState(SUBMISSION_ID, BASE);
    setSoil(SUBMISSION_ID, SOIL);
    expect(buildAnalysisReadyPayload(SUBMISSION_ID)).toBeNull();
  });

  it('returns a full payload when both weather and soil are ready', () => {
    initState(SUBMISSION_ID, BASE);
    setWeather(SUBMISSION_ID, WEATHER);
    setSoil(SUBMISSION_ID, SOIL);

    const payload = buildAnalysisReadyPayload(SUBMISSION_ID);

    expect(payload).not.toBeNull();
    expect(payload?.submissionId).toBe(SUBMISSION_ID);
    expect(payload?.farmId).toBe(FARM_ID);
    expect(payload?.cropType).toBe('maize');
    expect(payload?.location).toBe('Yaounde, Cameroon');
    expect(payload?.gpsLat).toBe(3.848);
    expect(payload?.gpsLng).toBe(11.502);
    expect(payload?.weather).toEqual(WEATHER);
    expect(payload?.soil).toEqual(SOIL);
  });

  it('includes userId, userEmail, and userName from state', () => {
    initState(SUBMISSION_ID, BASE);
    setWeather(SUBMISSION_ID, WEATHER);
    setSoil(SUBMISSION_ID, SOIL);

    const payload = buildAnalysisReadyPayload(SUBMISSION_ID);

    expect(payload?.userId).toBe(BASE.userId);
    expect(payload?.userEmail).toBe(BASE.userEmail);
    expect(payload?.userName).toBe(BASE.userName);
  });

  it('includes a readyAt ISO timestamp', () => {
    initState(SUBMISSION_ID, BASE);
    setWeather(SUBMISSION_ID, WEATHER);
    setSoil(SUBMISSION_ID, SOIL);

    const before  = Date.now();
    const payload = buildAnalysisReadyPayload(SUBMISSION_ID)!;
    const after   = Date.now();

    const ts = new Date(payload.readyAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('clears state after building so a second call returns null', () => {
    initState(SUBMISSION_ID, BASE);
    setWeather(SUBMISSION_ID, WEATHER);
    setSoil(SUBMISSION_ID, SOIL);

    buildAnalysisReadyPayload(SUBMISSION_ID);

    expect(buildAnalysisReadyPayload(SUBMISSION_ID)).toBeNull();
  });

  it('defaults userId to "anonymous" when omitted from state', () => {
    const { userId: _u, userEmail: _e, userName: _n, ...baseAnon } = BASE;
    initState(SUBMISSION_ID, baseAnon as Parameters<typeof initState>[1]);
    setWeather(SUBMISSION_ID, WEATHER);
    setSoil(SUBMISSION_ID, SOIL);

    const payload = buildAnalysisReadyPayload(SUBMISSION_ID);
    expect(payload?.userId).toBe('anonymous');
    expect(payload?.userEmail).toBe('');
    expect(payload?.userName).toBe('');
  });
});
