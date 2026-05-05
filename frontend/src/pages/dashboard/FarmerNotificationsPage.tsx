import { AlertCircle, Bell, Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { getMyNotifications, type Notification } from '../../services/notification.service';
import { extractApiError } from '../../services/auth.service';

const channelIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms:   <Bell className="h-4 w-4" />,
  push:  <Bell className="h-4 w-4" />,
};

function NotificationRow({ notif, isDark }: { notif: Notification; isDark: boolean }) {
  const date = new Date(notif.sentAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <li
      className={`flex items-start gap-4 p-4 transition ${
        isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'
        }`}
      >
        {channelIcon[notif.channel] ?? <Bell className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {notif.channel}
          </span>
        </div>
        <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {notif.message}
        </p>
        <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</p>
      </div>
    </li>
  );
}

export function FarmerNotificationsPage() {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setNotifications(await getMyNotifications());
    } catch (err) {
      setError(extractApiError(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Notification History"
        subtitle="All alerts and advisories sent to you by AgroSense AI."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-5 ${
            isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load notifications</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
            <button type="button" onClick={load} className="mt-2 text-sm font-semibold underline">
              Retry
            </button>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border py-20 text-center ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
          }`}
        >
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-50'
            }`}
          >
            <Bell className="h-8 w-8 text-blue-400" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            No notifications yet
          </p>
          <p className={`mt-1 max-w-xs text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Email alerts appear here once your first farm analysis generates a recommendation.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-2xl border ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
          }`}
        >
          <ul className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
            {notifications.map((notif) => (
              <NotificationRow key={notif.id} notif={notif} isDark={isDark} />
            ))}
          </ul>
        </div>
      )}
    </DashboardLayout>
  );
}
