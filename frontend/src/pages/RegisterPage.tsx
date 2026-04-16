import { AlertCircle, Eye, EyeOff, Languages, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { PasswordStrength } from '../components/auth/PasswordStrength';
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';
import { useAuth } from '../context/AuthContext';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
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

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <AuthSplitLayout
      formTitle="Create your AgroSense account"
      formDescription="Start with a polished, fully validated onboarding flow connected directly to your backend."
      panelTitle="Launch a smarter farming workflow from the first screen"
      panelDescription="API-backed account creation with persistent login and protected routes."
      panelHighlights={[
        'Validated onboarding with react-hook-form and Zod.',
        'Inline feedback for cleaner, more confident form completion.',
        'API-backed account creation with persistent login.',
        'Language support for English and French user journeys.',
      ]}
      footerLink={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
            Sign in instead
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
            <label htmlFor="name" className="text-sm font-semibold text-zinc-900">Full name</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...form.register('name')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Anya Okoro"
              />
            </div>
            {errors.name && <p className="text-sm text-rose-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-zinc-900">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@farm.com"
              />
            </div>
            {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
          </div>

          {/* Phone + Locale */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-zinc-900">Phone number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...form.register('phone')}
                  className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+2348012345678"
                />
              </div>
              {errors.phone && <p className="text-sm text-rose-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="locale" className="text-sm font-semibold text-zinc-900">Language</label>
              <div className="relative">
                <Languages className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  id="locale"
                  {...form.register('locale')}
                  className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-zinc-900">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...form.register('password')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-12 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
