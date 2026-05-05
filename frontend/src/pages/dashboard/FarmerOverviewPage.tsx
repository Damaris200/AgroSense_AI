import { AlertCircle, Bell, Leaf, Loader2, Sprout, Wheat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { extractApiError } from '../../services/auth.service';
import { getUserOverview, type UserOverview } from '../../services/admin.service';

const typeIcon = {
  recommendation: <Wheat className="h-4 w-4 text-emerald-600" />,
  farm:           <Leaf className="h-4 w-4 text-blue-600" />,
  notification:   <Bell className="h-4 w-4 text-amber-600" />,
};
const typeBg = {
  recommendation: 'bg-emerald-50',
  farm:           'bg-blue-50',
  notification:   'bg-amber-50',
};
const typeBgDark = {
  recommendation: 'bg-emerald-900/30',
  farm:           'bg-blue-900/30',
  notification:   'bg-amber-900/30',
};

export function FarmerOverviewPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  async function loadOverview() {
    setLoading(true);
    setError('');
    try {
      setOverview(await getUserOverview());
    } catch (err) {
      setError(extractApiError(err, 'Could not load overview.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadOverview(); }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Farmer'}!`}
        subtitle="Here's what's happening on your farms today."
      />

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
        <StatCard label="Farms Registered"    value={overview?.stats.farmsRegistered ?? 0}  icon={<Leaf className="h-5 w-5" />}  accent="blue"    sub="Active" />
        <StatCard label="Analyses Run"        value={overview?.stats.analysesRun ?? 0}      icon={<Sprout className="h-5 w-5" />} accent="emerald" sub="All time" />
        <StatCard label="Recommendations"     value={overview?.stats.recommendations ?? 0}  icon={<Wheat className="h-5 w-5" />}  accent="amber"   sub="Received" />
        <StatCard label="Notifications Sent"  value={overview?.stats.notificationsSent ?? 0} icon={<Bell className="h-5 w-5" />}   accent="emerald" sub="Via email" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* recent activity */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Recent Activity</h2>
          <ul className="space-y-3">
            {loading ? (
              <li className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </li>
            ) : (overview?.recentActivity ?? []).length === 0 ? (
              <li className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No activity yet.</li>
            ) : (
              overview?.recentActivity.map((item) => {
                const date = new Date(item.timestamp).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                });
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isDark ? typeBgDark[item.type as keyof typeof typeBgDark] : typeBg[item.type as keyof typeof typeBg]}`}>
                      {typeIcon[item.type as keyof typeof typeIcon]}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.text}</p>
                      <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* quick actions */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/dashboard/farms"
              className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-50 text-zinc-800 hover:bg-zinc-100'}`}
            >
              <Leaf className="h-4 w-4 text-emerald-600" />
              Submit a New Farm
            </Link>
            <Link
              to="/dashboard/recommendations"
              className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-50 text-zinc-800 hover:bg-zinc-100'}`}
            >
              <Wheat className="h-4 w-4 text-amber-600" />
              View Recommendations
            </Link>
            <Link
              to="/dashboard/notifications"
              className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-50 text-zinc-800 hover:bg-zinc-100'}`}
            >
              <Bell className="h-4 w-4 text-blue-600" />
              Notification History
            </Link>
          </div>

          <div className={`mt-6 rounded-xl p-4 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>How it works</p>
            <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-emerald-200/70' : 'text-emerald-700/80'}`}>
              Submit your farm details → we fetch weather &amp; soil data → AI generates a personalised recommendation → you receive an email notification.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
