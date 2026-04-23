import { Bell, Mail } from 'lucide-react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';

interface NotificationRecord {
  id:        string;
  channel:   'email' | 'sms' | 'push';
  message:   string;
  farmName:  string;
  sentAt:    string;
}

const mockNotifications: NotificationRecord[] = [
  { id: '1', channel: 'email', message: 'Irrigate within the next 24 hours. Soil moisture is trending down.', farmName: 'North Field',    sentAt: '2026-04-21T08:32:00.000Z' },
  { id: '2', channel: 'email', message: 'Apply phosphorus fertiliser before rainfall on April 18.',            farmName: 'North Field',    sentAt: '2026-04-18T14:17:00.000Z' },
  { id: '3', channel: 'email', message: 'Conditions are favourable for cassava planting.',                    farmName: 'River Boundary', sentAt: '2026-04-21T10:02:00.000Z' },
  { id: '4', channel: 'email', message: 'Soil analysis complete — low phosphorus detected.',                  farmName: 'North Field',    sentAt: '2026-04-15T09:00:00.000Z' },
];

const channelIcon = {
  email: <Mail className="h-4 w-4" />,
  sms:   <Bell className="h-4 w-4" />,
  push:  <Bell className="h-4 w-4" />,
};

export function FarmerNotificationsPage() {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <PageHeader
        title="Notification History"
        subtitle="All alerts and advisories sent to you by AgroSense AI."
      />

      {mockNotifications.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border py-16 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <Bell className="h-10 w-10 text-zinc-300" />
          <p className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No notifications yet</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Notifications will appear here after your first farm analysis.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <ul className="divide-y">
            {mockNotifications.map((notif) => {
              const date = new Date(notif.sentAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              });

              return (
                <li key={notif.id} className={`flex items-start gap-4 p-4 ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    {channelIcon[notif.channel]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>{notif.channel}</span>
                      <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{notif.farmName}</span>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{notif.message}</p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DashboardLayout>
  );
}
