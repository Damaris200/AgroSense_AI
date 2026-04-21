import { Activity, Bell, Leaf, Users } from 'lucide-react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { useTheme } from '../../context/ThemeContext';

interface ServiceStatus {
  name:   string;
  status: 'healthy' | 'degraded' | 'down';
  note?:  string;
}

const services: ServiceStatus[] = [
  { name: 'API Gateway',            status: 'healthy' },
  { name: 'Auth Service',           status: 'healthy' },
  { name: 'Farm Service',           status: 'healthy' },
  { name: 'Weather Service',        status: 'healthy' },
  { name: 'Soil Service',           status: 'healthy' },
  { name: 'Orchestrator Service',   status: 'healthy' },
  { name: 'AI Service',             status: 'healthy' },
  { name: 'Notification Service',   status: 'healthy' },
  { name: 'Analytics Service',      status: 'healthy' },
];

const statusStyles = {
  healthy:  { badge: 'bg-emerald-100 text-emerald-700', darkBadge: 'bg-emerald-900/40 text-emerald-300', dot: 'bg-emerald-500' },
  degraded: { badge: 'bg-amber-100 text-amber-700',     darkBadge: 'bg-amber-900/40 text-amber-300',     dot: 'bg-amber-500' },
  down:     { badge: 'bg-red-100 text-red-700',         darkBadge: 'bg-red-900/40 text-red-300',         dot: 'bg-red-500' },
};

const recentEvents = [
  { id: '1', topic: 'recommendation.generated', time: '2 min ago',  farmId: 'b2c3...891' },
  { id: '2', topic: 'soil.analyzed',            time: '3 min ago',  farmId: 'b2c3...891' },
  { id: '3', topic: 'weather.fetched',          time: '3 min ago',  farmId: 'b2c3...891' },
  { id: '4', topic: 'farm.saved',               time: '4 min ago',  farmId: 'b2c3...891' },
  { id: '5', topic: 'farm.submitted',           time: '4 min ago',  farmId: 'b2c3...891' },
];

export function AdminOverviewPage() {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <PageHeader title="Admin Overview" subtitle="System-wide metrics and service health." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users"           value={12}  icon={<Users className="h-5 w-5" />}    accent="blue"    sub="Registered" />
        <StatCard label="Farms Registered"      value={28}  icon={<Leaf className="h-5 w-5" />}     accent="emerald" sub="All time" />
        <StatCard label="Notifications Sent"    value={24}  icon={<Bell className="h-5 w-5" />}     accent="amber"   sub="Via email" />
        <StatCard label="Events Processed"      value={140} icon={<Activity className="h-5 w-5" />} accent="emerald" sub="Kafka messages" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* service health */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Service Health</h2>
          <ul className="space-y-2">
            {services.map((svc) => {
              const styles = statusStyles[svc.status];
              return (
                <li key={svc.name} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{svc.name}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${isDark ? styles.darkBadge : styles.badge}`}>{svc.status}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* recent Kafka events */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <h2 className={`mb-4 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Recent Kafka Events</h2>
          <ul className="space-y-2">
            {recentEvents.map((evt) => (
              <li key={evt.id} className={`rounded-xl px-3 py-2.5 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <code className={`text-xs font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{evt.topic}</code>
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{evt.time}</span>
                </div>
                <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>farmId: {evt.farmId}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
