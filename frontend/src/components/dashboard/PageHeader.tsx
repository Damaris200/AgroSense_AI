import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-stretch gap-3">
        <span className="mt-1 w-1 shrink-0 rounded-full bg-linear-to-b from-emerald-500 to-emerald-600" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className={`font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h1>
          {subtitle && <p className={`mt-1 max-w-3xl text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
