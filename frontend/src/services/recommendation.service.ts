import { api } from './auth.service';
import type { ApiEnvelope } from './auth.service';

export interface Recommendation {
  id:          string;
  farmId:      string;
  userId:      string;
  submissionId: string;
  content:     string;
  model:       string;
  generatedAt: string;
}

export async function getMyRecommendations(): Promise<Recommendation[]> {
  const res = await api.get<ApiEnvelope<Recommendation[]>>('/api/recommendations');
  return res.data.data;
}
