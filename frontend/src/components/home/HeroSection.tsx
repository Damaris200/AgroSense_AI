import { ArrowRight, BadgeCheck, Bot, Languages, Sprout, Wheat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useTheme } from '@/context/ThemeContext';

export function HeroSection() {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <section
      className={`relative overflow-hidden pt-32 transition-colors duration-300 sm:pt-36 ${
        isDark
          ? 'bg-linear-to-br from-zinc-950 via-emerald-950 to-green-900 text-white'
          : 'bg-linear-to-br from-emerald-900 via-green-800 to-lime-900 text-white'
      }`}
    >
      <div
        className={`animate-gradient-pan absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_75%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(120deg,rgba(0,0,0,0.35),rgba(0,0,0,0))]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_75%_20%,rgba(190,242,100,0.16),transparent_28%),linear-gradient(120deg,rgba(4,120,87,0.2),rgba(0,0,0,0))]'
        }`}
      />
      <div className="absolute inset-0">
        <div className="animate-float-slow absolute left-[8%] top-32 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
        <div
          className={`animate-drift absolute bottom-10 right-[10%] h-40 w-40 rounded-full blur-3xl ${
            isDark ? 'bg-emerald-300/10' : 'bg-lime-200/10'
          }`}
        />
        <svg
          aria-hidden="true"
          className="animate-float-slow absolute right-0 top-20 h-105 w-105 text-white/8"
          viewBox="0 0 320 320"
          fill="none"
        >
          <path
            d="M203 38c-9 38-29 73-59 105-27 29-60 49-97 60 8-38 29-73 59-104 28-30 60-50 97-61Z"
            fill="currentColor"
          />
          <path
            d="M266 104c-8 33-25 64-53 91-26 26-57 44-91 53 8-33 26-64 53-91 28-28 58-45 91-53Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100 backdrop-blur-sm">
            <Bot className="h-3.5 w-3.5" />
            {t('hero.badge')}
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
              {t('hero.title')}
              <span className="block text-emerald-200">{t('hero.subtitle')}</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-emerald-50/85 sm:text-lg">
              {t('hero.description')}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/register"
              aria-label={t('hero.ariaCtaPrimary')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
            >
              {t('hero.ctaPrimary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              aria-label={t('hero.ariaCtaSecondary')}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-100/80">{t('hero.stats.decisionCycleLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">{t('hero.stats.decisionCycleValue')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-100/80">{t('hero.stats.coverageLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">{t('hero.stats.coverageValue')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-100/80">{t('hero.stats.experienceLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">{t('hero.stats.experienceValue')}</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-end">
          <div className="w-full space-y-4">
            <div
              className={`rounded-[28px] border p-6 shadow-2xl backdrop-blur-sm ${
                isDark ? 'border-white/8 bg-zinc-950/35' : 'border-white/12 bg-white/12'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/85">{t('hero.snapshot.label')}</p>
                  <h2 className="mt-3 font-display text-2xl font-bold text-white">{t('hero.snapshot.title')}</h2>
                </div>
                <div className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {t('hero.snapshot.active')}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-zinc-950/20'}`}>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-lime-200" />
                    <p className="text-sm font-medium text-emerald-50">{t('hero.snapshot.recLabel')}</p>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">{t('hero.snapshot.recValue')}</p>
                  <p className="mt-2 text-sm text-emerald-100/75">{t('hero.snapshot.recHint')}</p>
                </div>

                <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-zinc-950/20'}`}>
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5 text-lime-200" />
                    <p className="text-sm font-medium text-emerald-50">{t('hero.snapshot.biLabel')}</p>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">{t('hero.snapshot.biValue')}</p>
                  <p className="mt-2 text-sm text-emerald-100/75">{t('hero.snapshot.biHint')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-3xl border p-5 backdrop-blur-sm ${
                  isDark ? 'border-white/8 bg-zinc-950/35' : 'border-white/10 bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Sprout className="h-5 w-5 text-emerald-100" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-100/80">{t('hero.snapshot.onboardingLabel')}</p>
                    <p className="text-lg font-semibold text-white">{t('hero.snapshot.onboardingValue')}</p>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-3xl border p-5 backdrop-blur-sm ${
                  isDark ? 'border-white/8 bg-zinc-950/35' : 'border-white/10 bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Wheat className="h-5 w-5 text-emerald-100" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-100/80">{t('hero.snapshot.guidanceLabel')}</p>
                    <p className="text-lg font-semibold text-white">{t('hero.snapshot.guidanceValue')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
