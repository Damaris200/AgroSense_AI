import { api } from './auth.service';
import type { ApiEnvelope } from './auth.service';

export interface Farm {
  id:          string;
  submissionId: string;
  userId:      string;
  name:        string;
  cropType:    string;
  location:    string;
  gpsLat:      number;
  gpsLng:      number;
  createdAt:   string;
}

export interface FarmSubmitPayload {
  name:     string;
  cropType: string;
  location: string;
  gpsLat:   number;
  gpsLng:   number;
}

export async function getMyFarms(): Promise<Farm[]> {
  const res = await api.get<ApiEnvelope<Farm[]>>('/api/farm');
  return res.data.data;
}

export async function submitFarm(payload: FarmSubmitPayload): Promise<{ submissionId: string }> {
  const res = await api.post<{ success: boolean; submissionId: string }>('/api/farm', payload);
  return { submissionId: res.data.submissionId };
}
