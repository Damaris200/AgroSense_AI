import { ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../context/ThemeContext';

export function CtaBanner() {
  const { isDark } = useTheme();

  return (
    <section
      id="impact"
      className={`scroll-mt-28 py-20 transition-colors duration-300 sm:py-24 ${
        isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#04110d_100%)]' : 'bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)]'
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div
          className={`rounded-[2rem] border p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-colors sm:p-10 lg:p-14 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-white'
          }`}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Quote className="h-6 w-6" />
              </div>
              <blockquote
                className={`font-display text-2xl font-semibold leading-tight sm:text-4xl ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                "When smallholder farmers get clear, timely advice, every field becomes more resilient, more
                productive, and more profitable."
              </blockquote>
              <p className={`text-base leading-8 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                AgroSense AI helps bridge the gap between climate uncertainty and confident daily farm decisions.
                The goal is not just prediction, but practical impact farmers can feel in the field.
              </p>
            </div>

            <div
              className={`rounded-[2rem] p-8 text-white ${
                isDark
                  ? 'bg-gradient-to-br from-zinc-900 via-emerald-950 to-green-900'
                  : 'bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900'
              }`}
            >
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">Why it matters</p>
              <div className="mt-6 space-y-4">
                <p className="text-lg leading-8 text-emerald-50/85">
                  Advisory quality means more than dashboards. It means helping farmers decide what to do next,
                  before uncertainty becomes loss.
                </p>
                <p className="text-sm leading-7 text-emerald-100/75">
                  Built for lecturers, evaluators, and real users to see a product that feels thoughtful, modern,
                  and ready for real deployment.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
