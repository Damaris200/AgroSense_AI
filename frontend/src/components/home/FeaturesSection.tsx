import {
  CloudRain,
  Droplets,
  Gauge,
  Languages,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

const stats = [
  { label: '< 2s recommendations', icon: Gauge },
  { label: '500+ farmers supported', icon: Users },
  { label: '99% uptime', icon: ShieldCheck },
  { label: 'Bilingual EN/FR', icon: Languages },
];

const features = [
  {
    title: 'Real-time weather integration',
    description: 'Live weather signals sharpen every recommendation with farm-specific timing and context.',
    icon: CloudRain,
  },
  {
    title: 'AI crop recommendations',
    description: 'The advisory engine turns field inputs into practical decisions farmers can act on immediately.',
    icon: Sparkles,
  },
  {
    title: 'Smart irrigation alerts',
    description: 'AgroSense flags moisture risk early so irrigation happens before stress reduces yield.',
    icon: Droplets,
  },
  {
    title: 'Event-driven architecture',
    description: 'Fast background processing keeps recommendations responsive as new weather and farm data arrive.',
    icon: Zap,
  },
  {
    title: 'Mobile-friendly dashboard',
    description: 'Every screen is designed for quick scanning on phones, tablets, and shared field devices.',
    icon: Smartphone,
  },
  {
    title: 'Bilingual support',
    description: 'English and French experiences help farmers and extension teams work in the language they trust.',
    icon: Languages,
  },
];

export function FeaturesSection() {
  const { isDark } = useTheme();

  return (
    <section
      id="features"
      className={`scroll-mt-28 py-20 transition-colors duration-300 sm:py-24 ${
        isDark
          ? 'bg-[linear-gradient(180deg,#04110d_0%,#091a14_30%,#020617_100%)]'
          : 'bg-[linear-gradient(180deg,#f5faf5_0%,#ffffff_30%,#eefbf3_100%)]'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div
          className={`rounded-4xl border p-6 shadow-[0_18px_60px_rgba(16,24,40,0.06)] transition-colors sm:p-8 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-white'
          }`}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`rounded-2xl border p-5 transition-colors ${
                    isDark ? 'border-white/10 bg-zinc-950/35' : 'border-emerald-100 bg-emerald-50/60'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <p className={`mt-4 text-sm font-semibold sm:text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 max-w-3xl space-y-4">
          <div
            className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
              isDark ? 'border-white/10 bg-white/5 text-emerald-200' : 'border-emerald-100 bg-white text-emerald-700'
            }`}
          >
            Core capabilities
          </div>
          <h2 className={`font-display text-3xl font-bold tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            Professional field intelligence designed for practical farming decisions
          </h2>
          <p className={`text-base leading-8 sm:text-lg ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The platform combines data, automation, and accessible UX so farmers can trust what the system says
            and act quickly when conditions change.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className={`rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-white'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`mt-5 font-display text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  {feature.title}
                </h3>
                <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
