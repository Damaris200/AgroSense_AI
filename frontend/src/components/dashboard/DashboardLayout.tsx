import {
  Bell,
  BarChart2,
  Leaf,
  LogOut,
  Menu,
  Sprout,
  Users,
  Wheat,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavItem {
  label: string;
  href:  string;
  icon:  ReactNode;
  roles: ('farmer' | 'agronomist' | 'admin')[];
}

const navItems: NavItem[] = [
  { label: 'Overview',        href: '/dashboard',                   icon: <BarChart2 className="h-4 w-4" />,  roles: ['farmer', 'agronomist'] },
  { label: 'My Farms',        href: '/dashboard/farms',             icon: <Leaf className="h-4 w-4" />,      roles: ['farmer', 'agronomist'] },
  { label: 'Recommendations', href: '/dashboard/recommendations',   icon: <Wheat className="h-4 w-4" />,     roles: ['farmer', 'agronomist'] },
  { label: 'Notifications',   href: '/dashboard/notifications',     icon: <Bell className="h-4 w-4" />,      roles: ['farmer', 'agronomist'] },
  { label: 'Admin Overview',  href: '/admin',                       icon: <BarChart2 className="h-4 w-4" />, roles: ['admin'] },
  { label: 'Users',           href: '/admin/users',                 icon: <Users className="h-4 w-4" />,     roles: ['admin'] },
  { label: 'Notifications',   href: '/admin/notifications',         icon: <Bell className="h-4 w-4" />,      roles: ['admin'] },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (user?.role ?? 'farmer') as 'farmer' | 'agronomist' | 'admin';
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
        <span className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>AgroSense AI</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {role === 'admin' && (
          <p className={`mb-1 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Admin</p>
        )}
        {role !== 'admin' && (
          <p className={`mb-1 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Farmer</p>
        )}
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
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-4 rounded-xl border p-3 ${isDark ? 'border-zinc-800 bg-zinc-800/60' : 'border-zinc-100 bg-zinc-50'}`}>
        <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
        <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  const mainBg = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900';

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg}`}>
      {/* desktop sidebar */}
      <div className="hidden w-56 flex-shrink-0 md:block">{sidebar}</div>

      {/* mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-56 z-50">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* mobile topbar */}
        <div className={`flex items-center gap-3 border-b px-4 py-3 md:hidden ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`rounded-lg p-1.5 ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>AgroSense AI</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
