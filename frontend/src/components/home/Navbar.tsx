import { LogOut, Menu, Moon, Sprout, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageToggle } from '@/components/LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface NavAuthButtonsProps {
  readonly isDark: boolean;
  readonly isAuthenticated: boolean;
  readonly logout: () => void;
}

function NavAuthButtons({ isDark, isAuthenticated, logout }: NavAuthButtonsProps) {
  const { t } = useTranslation();

  if (isAuthenticated) {
    return (
      <>
        <Link
          to="/dashboard"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            isDark ? 'text-emerald-100 hover:bg-white/10' : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          {t('nav.dashboard')}
        </Link>
        <button
          type="button"
          onClick={logout}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-zinc-950 text-white hover:bg-zinc-800'
          }`}
          aria-label={t('nav.signOut')}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('nav.signOut')}</span>
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        to="/login"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          isDark
            ? 'text-emerald-100 hover:bg-white/10'
            : 'text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        {t('nav.signIn')}
      </Link>
      <Link
        to="/register"
        className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition ${
          isDark
            ? 'bg-emerald-500 hover:bg-emerald-400'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {t('nav.getStarted')}
      </Link>
    </>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav.features'), href: '/#features' },
    { label: t('nav.howItWorks'), href: '/#how-it-works' },
    { label: t('nav.impact'), href: '/#impact' },
    { label: 'About Us', href: '/about' },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        className={`mx-auto mt-4 flex w-[min(1120px,calc(100%-1.5rem))] items-center justify-between rounded-full border px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors sm:px-6 ${
          isDark
            ? 'border-white/10 bg-zinc-950/70 text-white'
            : 'border-emerald-900/10 bg-white/75 text-zinc-950'
        }`}
      >
        <Link to="/" className="flex items-center gap-3" aria-label={t('nav.ariaHome')}>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              isDark ? 'bg-white/10 text-emerald-100' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">{t('brand.name')}</p>
            <p className={`text-xs ${isDark ? 'text-emerald-200/80' : 'text-emerald-700/80'}`}>
              {t('brand.tagline')}
            </p>
          </div>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={closeMenu}
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
          <LanguageToggle />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
            aria-pressed={isDark}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
              isDark
                ? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                : 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isDark ? <Moon className="h-4 w-4 text-amber-300" /> : <Sun className="h-4 w-4" />}
          </button>
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <NavAuthButtons isDark={isDark} isAuthenticated={isAuthenticated} logout={logout} />
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition lg:hidden ${
              isDark
                ? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                : 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="mx-auto mt-3 w-[min(1120px,calc(100%-1.5rem))] lg:hidden">
          <div
            className={`rounded-3xl border px-4 py-4 shadow-xl backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-zinc-950/95 text-white' : 'border-emerald-900/10 bg-white/95 text-zinc-900'
            }`}
          >
            <ul className="space-y-1 pb-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isDark ? 'text-emerald-50/85 hover:bg-white/10' : 'text-zinc-700 hover:bg-emerald-50'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              <NavAuthButtons isDark={isDark} isAuthenticated={isAuthenticated} logout={logout} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
