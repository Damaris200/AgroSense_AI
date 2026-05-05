import { api, type ApiEnvelope } from './auth.service';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'agronomist' | 'admin';
  isActive: boolean;
  locale: 'en' | 'fr';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  userId: string;
  farmId: string;
  message: string;
  channel: 'email' | 'sms' | 'push';
  sentAt: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface AdminOverview {
  stats: {
    totalUsers: number;
    totalFarms: number;
    notificationsSent: number;
    eventsProcessed: number;
  };
  services: Array<{ name: string; status: 'healthy' | 'degraded' | 'down'; note?: string }>;
  recentEvents: Array<{ id: string; eventType: string; submissionId: string; loggedAt: string }>;
}

export interface UserOverview {
  stats: {
    farmsRegistered: number;
    analysesRun: number;
    recommendations: number;
    notificationsSent: number;
  };
  recentActivity: Array<{ id: string; type: 'farm' | 'recommendation' | 'notification'; text: string; timestamp: string }>;
}

export async function getAdminUsers(ids?: string[]): Promise<AdminUser[]> {
  const query = ids?.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '';
  const res = await api.get<ApiEnvelope<{ users: AdminUser[] }>>(`/api/admin/users${query}`);
  return res.data.data.users;
}

export async function setAdminUserActive(id: string, isActive: boolean): Promise<AdminUser> {
  const res = await api.patch<ApiEnvelope<{ user: AdminUser }>>(`/api/admin/users/${id}/active`, { isActive });
  return res.data.data.user;
}

export async function getAdminNotifications(limit = 100): Promise<AdminNotification[]> {
  const res = await api.get<ApiEnvelope<AdminNotification[]>>('/api/admin/notifications', {
    params: { limit },
  });
  return res.data.data;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const res = await api.get<ApiEnvelope<AdminOverview>>('/api/admin/overview');
  return res.data.data;
}

export async function getUserOverview(): Promise<UserOverview> {
  const res = await api.get<ApiEnvelope<UserOverview>>('/api/overview');
  return res.data.data;
}
