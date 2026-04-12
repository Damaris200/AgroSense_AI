import {
  BellRing,
  CloudSun,
  Languages,
  LogOut,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const dashboardCards = [
  {
    title: 'Weather confidence',
    value: '92%',
    description: 'The forecast pipeline is healthy and feeding current advisory updates.',
    icon: CloudSun,
  },
  {
    title: 'Recommended action',
    value: 'Irrigation',
    description: 'Next advisory suggests a water check within the next 24 hours.',
    icon: BellRing,
  },
  {
    title: 'System status',
    value: 'Stable',
    description: 'Protected API routing and token refresh are active for this session.',
    icon: ShieldCheck,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_35%),linear-gradient(180deg,#f3f8f2_0%,#ffffff_42%,#ecfdf5_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900 p-6 text-white shadow-[0_24px_80px_rgba(4,120,87,0.22)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                <Sprout className="h-3.5 w-3.5" />
                Protected dashboard
              </div>
              <div>
                <p className="text-sm text-emerald-100/80">Welcome back</p>
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {user?.name ?? 'Farmer dashboard'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/82 sm:text-base">
                  Your authentication flow is now wired to the backend API with persistent login, protected routes,
                  and a cleaner, presentation-ready experience.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                View landing page
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_60px_rgba(16,24,40,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-medium text-zinc-500">{card.title}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-zinc-950">{card.value}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{card.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.42fr]">
          <article className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_60px_rgba(16,24,40,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-950">Session summary</h2>
                <p className="text-sm text-zinc-500">What this upgraded flow now supports</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50/70 p-4">
                <p className="text-sm font-semibold text-zinc-950">Persistent login</p>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Tokens are stored in localStorage and attached automatically via an axios interceptor.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50/70 p-4">
                <p className="text-sm font-semibold text-zinc-950">Protected routes</p>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Unauthenticated users are redirected to sign in before they can access `/dashboard`.
                </p>
              </div>
            </div>
          </article>

          <aside className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_60px_rgba(16,24,40,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Languages className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-zinc-950">Profile</h2>
                <p className="text-sm text-zinc-500">Current authenticated user</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="mt-1 font-medium text-zinc-950">{user?.email ?? 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Role</dt>
                <dd className="mt-1 font-medium capitalize text-zinc-950">{user?.role ?? 'Farmer'}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Language</dt>
                <dd className="mt-1 font-medium uppercase text-zinc-950">{user?.locale ?? 'EN'}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
