import {
  Bell,
  BarChart2,
  CloudRain,
  FlaskConical,
  Leaf,
  LogOut,
  Menu,
  Moon,
   Sparkles,
  Sprout,
  Sun,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { LanguageToggle } from '@/components/LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface NavItem {
  labelKey: string;
  href:     string;
  icon:     ReactNode;
  roles:    ('farmer' | 'agronomist' | 'admin')[];
}

const navItems: NavItem[] = [
  { labelKey: 'dashboard.items.overview',           href: '/dashboard',                 icon: <BarChart2 className="h-4 w-4" />,    roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.myFarms',            href: '/dashboard/farms',           icon: <Leaf className="h-4 w-4" />,         roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.weather',            href: '/dashboard/weather',         icon: <CloudRain className="h-4 w-4" />,    roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.soilAnalysis',       href: '/dashboard/soil',            icon: <FlaskConical className="h-4 w-4" />, roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.recommendations',    href: '/dashboard/recommendations', icon: <Sparkles className="h-4 w-4" />,     roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.notifications',      href: '/dashboard/notifications',   icon: <Bell className="h-4 w-4" />,         roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.profile',            href: '/dashboard/profile',         icon: <UserCircle className="h-4 w-4" />,   roles: ['farmer', 'agronomist'] },
  { labelKey: 'dashboard.items.adminOverview',      href: '/admin',                     icon: <BarChart2 className="h-4 w-4" />,    roles: ['admin'] },
  { labelKey: 'dashboard.items.users',              href: '/admin/users',               icon: <Users className="h-4 w-4" />,        roles: ['admin'] },
  { labelKey: 'dashboard.items.adminNotifications', href: '/admin/notifications',       icon: <Bell className="h-4 w-4" />,         roles: ['admin'] },
];

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role ?? 'farmer';
  const visible = navItems.filter((item) => item.roles.includes(role));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebarBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const activeCls = isDark
    ? 'bg-emerald-900/50 text-emerald-200 font-semibold'
    : 'bg-emerald-50 text-emerald-800 font-semibold';
  const inactiveCls = isDark
    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900';

  const sidebar = (
    <aside
      className={`flex h-full flex-col border-r px-4 py-6 ${sidebarBg}`}
    >
      <Link to="/" className="mb-8 flex items-center gap-3 px-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-700'}`}>
          <Sprout className="h-4 w-4" />
        </div>
        <span className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('brand.name')}</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <p className={`mb-1 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {role === 'admin' ? t('dashboard.sectionAdmin') : t('dashboard.sectionFarmer')}
        </p>
        {visible.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard' || item.href === '/admin'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? activeCls : inactiveCls}`
            }
          >
            {item.icon}
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-4 rounded-xl border p-3 ${isDark ? 'border-zinc-800 bg-zinc-800/60' : 'border-zinc-100 bg-zinc-50'}`}>
        <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
        <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user?.email}</p>
        <LanguageToggle variant="sidebar" />
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('dashboard.signOut')}
        </button>
      </div>
    </aside>
  );

  const mainBg = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900';

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg}`}>
      {/* desktop sidebar */}
      <div className="hidden w-56 shrink-0 md:block">{sidebar}</div>

      {/* mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={t('dashboard.closeSidebar')}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-56 z-50">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* topbar */}
        <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-1.5 md:hidden ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t('brand.name')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('dashboard.signOut')}</span>
            </button>
            <LanguageToggle />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800 text-amber-300 hover:bg-zinc-700'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
