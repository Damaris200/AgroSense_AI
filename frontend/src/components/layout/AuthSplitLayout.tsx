import type { ReactNode } from 'react';
import { Leaf, Radar, ShieldCheck, Sparkles, Wheat } from 'lucide-react';

interface AuthSplitLayoutProps {
  formTitle: string;
  formDescription: string;
  panelTitle: string;
  panelDescription: string;
  panelHighlights: string[];
  footerLink: ReactNode;
  children: ReactNode;
}

const panelStats = [
  { label: 'Advisories delivered', value: '12.4k' },
  { label: 'Supported regions', value: '48' },
  { label: 'Uptime', value: '99%' },
];

const panelIcons = [Leaf, Radar, ShieldCheck, Sparkles];

export function AuthSplitLayout({
  formTitle,
  formDescription,
  panelTitle,
  panelDescription,
  panelHighlights,
  footerLink,
  children,
}: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),_transparent_45%),linear-gradient(180deg,#f3f8f2_0%,#ffffff_42%,#ecfdf5_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8 md:grid md:grid-cols-2 md:gap-6">
        <section className="order-1 flex items-center justify-center py-4 md:order-2 md:py-0">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                AgroSense AI
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                {formTitle}
              </h1>
              <p className="text-sm leading-7 text-zinc-600 sm:text-base">{formDescription}</p>
            </div>

            <div>{children}</div>

            <div className="mt-8 border-t border-zinc-100 pt-5 text-sm text-zinc-600">{footerLink}</div>
          </div>
        </section>

        <section className="relative order-2 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900 px-6 py-8 text-white shadow-[0_24px_80px_rgba(4,120,87,0.2)] md:order-1 md:flex md:flex-col md:justify-between md:px-8 md:py-10">
          <div className="absolute inset-0">
            <div className="animate-drift absolute -top-20 right-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="animate-float-slow absolute bottom-0 left-0 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" />
            <svg
              aria-hidden="true"
              className="animate-float-slow absolute -right-8 top-16 h-36 w-36 text-white/10"
              viewBox="0 0 120 120"
              fill="none"
            >
              <path
                d="M60 14C53 34 35 38 28 55c-8 20 5 41 24 47 18 6 39-2 48-22 9-21 1-49-40-66Z"
                fill="currentColor"
              />
              <path d="M46 62c14-2 28-10 41-26" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
                <Wheat className="h-6 w-6 text-emerald-100" />
              </div>
              <div>
                <p className="font-display text-xl font-bold">AgroSense AI</p>
                <p className="text-sm text-emerald-100/80">Event-driven farm intelligence</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100 backdrop-blur-sm">
                <Leaf className="h-3.5 w-3.5" />
                Built for smallholder resilience
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{panelTitle}</h2>
              <p className="max-w-xl text-sm leading-7 text-emerald-50/85 sm:text-base">{panelDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {panelHighlights.map((item, index) => {
                const Icon = panelIcons[index % panelIcons.length];

                return (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-3 h-5 w-5 text-emerald-100" />
                    <p className="text-sm leading-6 text-emerald-50">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-8 rounded-3xl border border-white/10 bg-zinc-950/20 p-5 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4">
              {panelStats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-100/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
