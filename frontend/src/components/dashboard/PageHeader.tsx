import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PageHeaderProps {
  title:    string;
  subtitle?: string;
  action?:  ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h1>
        {subtitle && <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
