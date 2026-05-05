export interface WeatherSummary {
  temperature: number;
  humidity:    number;
  rainfall:    number;
  description: string;
}

export interface SoilSummary {
  pH:         number;
  moisture:   number;
  nitrogen:   number;
  phosphorus: number;
  potassium:  number;
}

export interface AnalysisReadyPayload {
  submissionId: string;
  farmId:       string;
  userId:       string;
  userEmail:    string;
  userName:     string;
  cropType:     string;
  location:     string;
  gpsLat:       number;
  gpsLng:       number;
  weather:      WeatherSummary;
  soil:         SoilSummary;
  readyAt:      string;
}
