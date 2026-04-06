export const STREAMS = {
  FARM_OBSERVATIONS: 'farm:observations',
  WEATHER_UPDATES: 'weather:updates',
  RECOMMENDATIONS: 'ai:recommendations',
} as const;

export type StreamName = (typeof STREAMS)[keyof typeof STREAMS];

export interface FarmObservationEvent {
  type: 'farm.observation';
  farmId: string;
  userId: string;
  soilMoisture?: number;
  cropType?: string;
  growthStage?: string;
  notes?: string;
  timestamp: string;
}

export interface WeatherUpdateEvent {
  type: 'weather.update';
  farmId: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  timestamp: string;
}

export interface RecommendationEvent {
  type: 'ai.recommendation';
  farmId: string;
  userId: string;
  action: 'plant' | 'irrigate' | 'fertilize' | 'harvest' | 'protect';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export type AgroEvent = FarmObservationEvent | WeatherUpdateEvent | RecommendationEvent;
