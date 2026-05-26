import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/context/ThemeContext';
import type { Language } from '@/i18n';

interface LanguageToggleProps {
  readonly variant?: 'navbar' | 'sidebar';
}

export function LanguageToggle({ variant = 'navbar' }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const { isDark } = useTheme();

  const current = (i18n.resolvedLanguage ?? 'en') as Language;
  const next: Language = current === 'en' ? 'fr' : 'en';
  const nextLabel = next === 'fr' ? t('language.french') : t('language.english');

  function handleToggle() {
    void i18n.changeLanguage(next);
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('language.switchTo', { lang: nextLabel })}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
          isDark
            ? 'border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800'
            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
        }`}
      >
        <Languages className="h-3.5 w-3.5" />
        {current.toUpperCase()} → {next.toUpperCase()}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t('language.switchTo', { lang: nextLabel })}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
        isDark
          ? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
          : 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
      }`}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{current === 'en' ? 'EN' : 'FR'}</span>
    </button>
  );
}
