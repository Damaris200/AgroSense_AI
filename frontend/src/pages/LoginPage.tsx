import { AlertCircle, Eye, EyeOff, LoaderCircle, Mail, LockKeyhole } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';
import { useAuth } from '../context/AuthContext';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { form, onSubmit, apiError, showPassword, togglePassword, isSubmitting, errors } =
    useLoginForm();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <AuthSplitLayout
      formTitle="Sign in to AgroSense AI"
      formDescription="Access your farm dashboard, latest recommendations, and real-time advisory updates."
      panelTitle="Professional farm intelligence, ready when you are"
      panelDescription="API-backed authentication with persistent sessions and protected routes."
      panelHighlights={[
        'Real-time advisory delivery with API-backed authentication.',
        'Mobile-first UI designed for farmers and evaluators.',
        'Persistent sessions so refreshes do not log users out.',
        'Bilingual experience for English and French workflows.',
      ]}
      footerLink={
        <p>
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
            Create one here
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
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-zinc-900">
              Email address
            </label>
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

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-zinc-900">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...form.register('password')}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-12 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your password"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
