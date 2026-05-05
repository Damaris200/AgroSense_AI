import { Activity, AlertCircle, Bell, Leaf, Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { useTheme } from '../../context/ThemeContext';
import { extractApiError } from '../../services/auth.service';
import { getAdminOverview, type AdminOverview } from '../../services/admin.service';

const statusStyles = {
  healthy:  { badge: 'bg-emerald-100 text-emerald-700', darkBadge: 'bg-emerald-900/40 text-emerald-300', dot: 'bg-emerald-500' },
  degraded: { badge: 'bg-amber-100 text-amber-700',     darkBadge: 'bg-amber-900/40 text-amber-300',     dot: 'bg-amber-500' },
  down:     { badge: 'bg-red-100 text-red-700',         darkBadge: 'bg-red-900/40 text-red-300',         dot: 'bg-red-500' },
};

export function AdminOverviewPage() {
  const { isDark } = useTheme();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOverview() {
    setLoading(true);
    setError('');
    try {
      setOverview(await getAdminOverview());
    } catch (err) {
      setError(extractApiError(err, 'Could not load admin overview.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadOverview(); }, []);

  return (
    <DashboardLayout>
      <PageHeader title="Admin Overview" subtitle="System-wide metrics and service health." />

      {error && (
        <div className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load overview</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users"           value={overview?.stats.totalUsers ?? 0}          icon={<Users className="h-5 w-5" />}    accent="blue"    sub="Registered" />
        <StatCard label="Farms Registered"      value={overview?.stats.totalFarms ?? 0}          icon={<Leaf className="h-5 w-5" />}     accent="emerald" sub="All time" />
        <StatCard label="Notifications Sent"    value={overview?.stats.notificationsSent ?? 0}   icon={<Bell className="h-5 w-5" />}     accent="amber"   sub="Via email" />
        <StatCard label="Events Processed"      value={overview?.stats.eventsProcessed ?? 0}     icon={<Activity className="h-5 w-5" />} accent="emerald" sub="Kafka messages" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* service health */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Service Health</h2>
          <ul className="space-y-2">
            {loading ? (
              <li className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </li>
            ) : (overview?.services ?? []).map((svc) => {
              const styles = statusStyles[svc.status];
              return (
                <li key={svc.name} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{svc.name}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${isDark ? styles.darkBadge : styles.badge}`}>
                    {svc.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* recent Kafka events */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Recent Kafka Events</h2>
          <ul className="space-y-2">
            {loading ? (
              <li className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </li>
            ) : (overview?.recentEvents ?? []).length === 0 ? (
              <li className={`rounded-xl px-3 py-2.5 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                No recent events.
              </li>
            ) : (
              (overview?.recentEvents ?? []).map((evt) => {
                const date = new Date(evt.loggedAt).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                });
                return (
                  <li key={evt.id} className={`rounded-xl px-3 py-2.5 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <code className={`text-xs font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{evt.eventType}</code>
                      <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</span>
                    </div>
                    <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>submissionId: {evt.submissionId}</p>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
