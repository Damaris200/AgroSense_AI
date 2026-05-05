import { AlertCircle, Bell, Filter, Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { extractApiError } from '../../services/auth.service';
import { getAdminNotifications, type AdminNotification } from '../../services/admin.service';

const channelIcon = {
  email: <Mail className="h-4 w-4" />,
  sms:   <Bell className="h-4 w-4" />,
  push:  <Bell className="h-4 w-4" />,
};

const statusStyles = {
  sent:    { badge: 'bg-emerald-100 text-emerald-700',    darkBadge: 'bg-emerald-900/40 text-emerald-300', dot: 'bg-emerald-500' },
  failed:  { badge: 'bg-red-100 text-red-700',            darkBadge: 'bg-red-900/40 text-red-300',         dot: 'bg-red-500' },
  pending: { badge: 'bg-amber-100 text-amber-700',        darkBadge: 'bg-amber-900/40 text-amber-300',     dot: 'bg-amber-500' },
};

const statusFilterButton = {
  sent: {
    light: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dark:  'border-emerald-700 bg-emerald-900/40 text-emerald-300',
  },
  failed: {
    light: 'border-red-200 bg-red-50 text-red-700',
    dark:  'border-red-700 bg-red-900/40 text-red-300',
  },
  pending: {
    light: 'border-amber-200 bg-amber-50 text-amber-700',
    dark:  'border-amber-700 bg-amber-900/40 text-amber-300',
  },
};

export function AdminNotificationsPage() {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filtered = notifications.filter(
    (n) => filter === 'all' || n.status === filter,
  );

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    failed: notifications.filter((n) => n.status === 'failed').length,
    pending: notifications.filter((n) => n.status === 'pending').length,
  };

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      setNotifications(await getAdminNotifications());
    } catch (err) {
      setError(extractApiError(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadNotifications(); }, []);

  return (
    <DashboardLayout>
      <PageHeader title="Notification Logs" subtitle="Monitor all notifications sent to farmers and users." />

      {error && (
        <div className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load notifications</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Total Sent</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{stats.sent}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Failed</p>
          <p className={`mt-2 text-2xl font-bold text-red-600`}>{stats.failed}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Pending</p>
          <p className={`mt-2 text-2xl font-bold text-amber-600`}>{stats.pending}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Total</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{stats.total}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? isDark
                ? 'border-emerald-700 bg-emerald-900/40 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : isDark
                ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          All
        </button>
        {(['sent', 'failed', 'pending'] as const).map((status) => {
          const filterStyle = statusFilterButton[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition ${
                filter === status
                  ? isDark
                    ? filterStyle.dark
                    : filterStyle.light
                  : isDark
                    ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-screen text-sm">{/*table that spans the width needed for columns*/}
            <thead>
              <tr className={isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}>
                {['Channel', 'Recipient', 'Message', 'Status', 'Time'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-500" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-10 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No notifications found.</td>
                </tr>
              ) : (
                filtered.map((notif) => {
                  const date = new Date(notif.sentAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const style = statusStyles[notif.status];

                  return (
                    <tr key={notif.id} className={`transition ${isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'}`}>
                      <td className="px-4 py-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                          {channelIcon[notif.channel]}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{notif.recipient}</td>
                      <td className={`px-4 py-3 max-w-xs truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{notif.message}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isDark ? style.darkBadge : style.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {notif.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs whitespace-nowrap ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
