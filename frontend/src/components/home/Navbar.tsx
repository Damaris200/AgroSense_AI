import { LogOut, Moon, Sprout, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Impact', href: '#impact' },
];

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        className={`mx-auto mt-4 flex w-[min(1120px,calc(100%-1.5rem))] items-center justify-between rounded-full border px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors sm:px-6 ${
          isDark
            ? 'border-white/10 bg-zinc-950/70 text-white'
            : 'border-emerald-900/10 bg-white/75 text-zinc-950'
        }`}
      >
        <Link to="/" className="flex items-center gap-3" aria-label="AgroSense AI home">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              isDark ? 'bg-white/10 text-emerald-100' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">AgroSense AI</p>
            <p className={`text-xs ${isDark ? 'text-emerald-200/80' : 'text-emerald-700/80'}`}>
              Smart decisions for every farm
            </p>
          </div>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`text-sm font-medium transition ${
                  isDark ? 'text-emerald-50/80 hover:text-white' : 'text-zinc-600 hover:text-emerald-700'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-pressed={isDark}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
              isDark
                ? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                : 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                isDark ? 'bg-zinc-900 text-amber-300' : 'bg-white text-emerald-700'
              }`}
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
            <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'} Mode</span>
          </button>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isDark ? 'text-emerald-100 hover:bg-white/10' : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/15'
                    : 'bg-zinc-950 text-white hover:bg-zinc-800'
                }`}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isDark ? 'text-emerald-100 hover:bg-white/10' : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                    : 'bg-emerald-600 text-black hover:bg-emerald-700'
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
