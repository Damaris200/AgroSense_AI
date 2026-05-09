export interface AnalysisReadyEvent {
  submissionId: string;
  farmId:       string;
  userId?:      string;
  userEmail?:   string;
  userName?:    string;
  cropType:     string;
  location:     string;
  gpsLat:       number;
  gpsLng:       number;
  weather: {
    temperature: number;
    humidity:    number;
    rainfall:    number;
    windSpeed?:  number;
    description: string;
  };
  soil: {
    pH:         number;
    moisture:   number;
    nitrogen:   number;
    phosphorus: number;
    potassium:  number;
  };
  readyAt: string;
}

export interface RecommendationGeneratedEvent {
  submissionId:   string;
  farmId:         string;
  userId:         string;
  userEmail:      string;
  userName:       string;
  cropType:       string;
  location:       string;
  recommendation: string;
  model:          string;
  generatedAt:    string;
}
