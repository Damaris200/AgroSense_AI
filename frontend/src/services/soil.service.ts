import { api } from './auth.service';
import type { ApiEnvelope } from './auth.service';

export interface SoilRecord {
  id:         string;
  farmId:     string;
  ph:         number;
  moisture:   number;
  nitrogen:   number;
  phosphorus: number;
  potassium:  number;
  analyzedAt: string;
}

export async function getSoilForFarm(farmId: string): Promise<SoilRecord[]> {
  const res = await api.get<ApiEnvelope<SoilRecord[]>>('/api/soil', {
    params: { farmId },
  });
  return res.data.data;
}
