interface AnalysisState {
  farmId:      string;
  submissionId: string;
  userId?:     string;
  userEmail?:  string;
  userName?:   string;
  cropType:    string;
  location:    string;
  gpsLat:      number;
  gpsLng:      number;
  weather?: {
    temperature: number;
    humidity:    number;
    rainfall:    number;
    windSpeed:   number;
    description: string;
  };
  soil?: {
    pH:         number;
    moisture:   number;
    nitrogen:   number;
    phosphorus: number;
    potassium:  number;
  };
}

const state = new Map<string, AnalysisState>();

export function initState(submissionId: string, data: Omit<AnalysisState, 'weather' | 'soil'>) {
  if (!state.has(submissionId)) {
    state.set(submissionId, { ...data });
    console.log(`[orchestrator] initialized state for submissionId=${submissionId}`);
  }
}

export function setWeather(submissionId: string, weather: AnalysisState['weather']) {
  const entry = state.get(submissionId);
  if (entry) {
    entry.weather = weather;
    console.log(`[orchestrator] weather received for submissionId=${submissionId}`);
  }
}

export function setSoil(submissionId: string, soil: AnalysisState['soil']) {
  const entry = state.get(submissionId);
  if (entry) {
    entry.soil = soil;
    console.log(`[orchestrator] soil received for submissionId=${submissionId}`);
  }
}

export function isReady(submissionId: string): boolean {
  const entry = state.get(submissionId);
  return !!(entry?.weather && entry?.soil);
}

export function getState(submissionId: string): AnalysisState | undefined {
  return state.get(submissionId);
}

export function clearState(submissionId: string) {
  state.delete(submissionId);
}
