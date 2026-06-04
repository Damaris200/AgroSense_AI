import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly icon: ReactNode;
  readonly accent?: 'emerald' | 'blue' | 'amber' | 'red';
  readonly sub?: string;
}

const accentMap = {
  emerald: { bg: 'bg-emerald-100 text-emerald-700', darkBg: 'bg-emerald-900/40 text-emerald-300' },
  blue:    { bg: 'bg-blue-100 text-blue-700',       darkBg: 'bg-blue-900/40 text-blue-300' },
  amber:   { bg: 'bg-amber-100 text-amber-700',     darkBg: 'bg-amber-900/40 text-amber-300' },
  red:     { bg: 'bg-red-100 text-red-700',         darkBg: 'bg-red-900/40 text-red-300' },
};

export function StatCard({ label, value, icon, accent = 'emerald', sub }: StatCardProps) {
  const { isDark } = useTheme();
  const colors = accentMap[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        isDark
          ? 'border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20 hover:border-zinc-700'
          : 'border-zinc-100 bg-white shadow-sm hover:border-zinc-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</p>
          <p className={`mt-1.5 font-display text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
          {sub && <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${isDark ? colors.darkBg : colors.bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
