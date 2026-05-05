import {
  getState,
  isReady,
  clearState,
} from '../state/analysis.state';
import type { AnalysisReadyPayload } from '../models/analysis.model';

export function buildAnalysisReadyPayload(submissionId: string): AnalysisReadyPayload | null {
  if (!isReady(submissionId)) return null;

  const state = getState(submissionId);
  if (!state?.weather || !state?.soil) return null;

  const payload: AnalysisReadyPayload = {
    submissionId,
    farmId:    state.farmId,
    userId:    state.userId    ?? 'anonymous',
    userEmail: state.userEmail ?? '',
    userName:  state.userName  ?? '',
    cropType:  state.cropType,
    location:  state.location,
    gpsLat:    state.gpsLat,
    gpsLng:    state.gpsLng,
    weather:   state.weather,
    soil:      state.soil,
    readyAt:   new Date().toISOString(),
  };

  clearState(submissionId);
  return payload;
}
