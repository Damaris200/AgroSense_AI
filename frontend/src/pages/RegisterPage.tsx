import { AlertCircle, Eye, EyeOff, Languages, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';

import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { getPostLoginRoute } from '@/utils/authRoute';

export function RegisterPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const {
    form,
    onSubmit,
    apiError,
    showPassword,
    togglePassword,
    passwordValue,
    isSubmitting,
    errors,
  } = useRegisterForm();

  if (isAuthenticated) return <Navigate to={getPostLoginRoute(user?.role)} replace />;

  return (
    <AuthSplitLayout
      formTitle={t('auth.register.formTitle')}
      formDescription={t('auth.register.formDescription')}
      panelTitle={t('auth.register.panelTitle')}
      panelDescription={t('auth.register.panelDescription')}
      panelHighlights={[
        t('auth.register.highlight1'),
        t('auth.register.highlight2'),
        t('auth.register.highlight3'),
        t('auth.register.highlight4'),
      ]}
      footerLink={
        <p>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
            {t('auth.register.signInInstead')}
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-6">
        {apiError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {/* Full name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-zinc-900">{t('auth.register.fullName')}</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...form.register('name')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('auth.register.fullNamePlaceholder')}
              />
            </div>
            {errors.name && <p className="text-sm text-rose-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-zinc-900">{t('auth.register.email')}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('auth.register.emailPlaceholder')}
              />
            </div>
            {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
          </div>

          {/* Phone + Locale */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-zinc-900">{t('auth.register.phone')}</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...form.register('phone')}
                  className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t('auth.register.phonePlaceholder')}
                />
              </div>
              {errors.phone && <p className="text-sm text-rose-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="locale" className="text-sm font-semibold text-zinc-900">{t('auth.register.language')}</label>
              <div className="relative">
                <Languages className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  id="locale"
                  {...form.register('locale')}
                  className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="en">{t('auth.register.english')}</option>
                  <option value="fr">{t('auth.register.french')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-zinc-900">{t('auth.register.password')}</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...form.register('password')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-12 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('auth.register.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength value={passwordValue} />
            {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {t('auth.register.submitting')}
              </>
            ) : (
              t('auth.register.submit')
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
