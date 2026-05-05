import { api } from './auth.service';
import type { ApiEnvelope } from './auth.service';

export interface Notification {
  id:      string;
  userId:  string;
  farmId:  string;
  message: string;
  channel: string;
  sentAt:  string;
}

export async function getMyNotifications(): Promise<Notification[]> {
  const res = await api.get<ApiEnvelope<Notification[]>>('/api/notifications');
  return res.data.data;
}
