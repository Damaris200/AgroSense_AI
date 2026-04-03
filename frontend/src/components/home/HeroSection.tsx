import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { heroStats, heroTypedWords, weatherItems } from '../../data/content';

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = useMemo(() => heroTypedWords[wordIndex], [wordIndex]);

  useEffect(() => {
    const pauseAtWordEnd = 1400;
    const typingDelay = isDeleting ? 50 : 95;

    if (!isDeleting && charIndex === currentWord.length) {
      const pauseTimer = window.setTimeout(() => setIsDeleting(true), pauseAtWordEnd);
      return () => window.clearTimeout(pauseTimer);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % heroTypedWords.length);
      return;
    }

    const timer = window.setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, typingDelay);

    return () => window.clearTimeout(timer);
  }, [charIndex, currentWord, isDeleting]);

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background with agriculture theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-gradient-to-tl from-amber-200/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-900/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Decorative farming pattern */}
      <div className="absolute inset-0 opacity-40">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <pattern id="farming-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="3" fill="#10b981" opacity="0.1"/>
              <circle cx="150" cy="100" r="2" fill="#34d399" opacity="0.08"/>
              <path d="M 40 40 Q 60 50 80 40" stroke="#10b981" strokeWidth="0.5" fill="none" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="1440" height="900" fill="url(#farming-pattern)"/>
        </svg>
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:px-8 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white px-4 py-2.5 shadow-md shadow-emerald-100/50 backdrop-blur">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse delay-75" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse delay-150" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-emerald-700">AI-powered farming for Africa</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl font-black leading-tight text-zinc-950">
              Transform Your
              <br />
              <span className="inline-block mt-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Farm's Future
              </span>
            </h1>
            <div className="h-16 md:h-24">
              <p className="font-display text-3xl md:text-5xl font-bold text-emerald-600">
                {currentWord.slice(0, charIndex)}
                <span className="ml-1 animate-pulse">▼</span>
              </p>
            </div>
          </div>

          <p className="max-w-xl text-lg leading-8 text-zinc-600">
            Real-time AI recommendations based on soil conditions, weather patterns, and crop growth stages. Get actionable insights delivered instantly—even with basic phones.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="group rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/40 transition hover:shadow-emerald-600/60 hover:scale-105 hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Start Free Today
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <a
              href="#how"
              className="group rounded-xl border-2 border-emerald-600 px-7 py-3.5 text-base font-bold text-emerald-700 bg-white/50 backdrop-blur transition hover:bg-emerald-50 hover:border-emerald-700"
            >
              <span className="flex items-center gap-2">
                See How It Works
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-emerald-100 pt-8">
            {heroStats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-zinc-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-6">
          {/* AI Analysis Card */}
          <div className="group relative rounded-3xl border-2 border-emerald-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all hover:border-emerald-300/80 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse delay-75" />
                  <span className="h-3 w-3 rounded-full bg-rose-400 animate-pulse delay-150" />
                </div>
                <p className="font-display text-xs font-bold uppercase tracking-widest text-emerald-600">
                  🌾 AI Analysis
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700">Farm: Maize Field</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-100">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700">Soil Moisture</span>
                    <span className="text-sm font-bold text-emerald-600">65%</span>
                  </div>
                  <div className="h-2 rounded-full bg-blue-100">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700">Growth Stage</span>
                    <span className="text-sm font-bold text-amber-600">V6</span>
                  </div>
                  <div className="h-2 rounded-full bg-amber-100">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-emerald-100 pt-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50">
                  <span className="text-lg mt-0.5">💧</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">Recommendation</p>
                    <p className="text-xs text-emerald-700">Irrigate in 2-3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="grid grid-cols-2 gap-4">
            {weatherItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-emerald-100 bg-white/60 backdrop-blur p-4 shadow-lg shadow-emerald-600/5 hover:shadow-emerald-600/15 transition"
              >
                <p className="text-2xl mb-2">{item.symbol === 'T' ? '🌡️' : item.symbol === 'H' ? '💧' : item.symbol === 'R' ? '🌧️' : '💨'}</p>
                <p className="text-xs text-zinc-600 font-medium">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
                <div className="h-2 flex-1 rounded-full bg-zinc-100">
                  <div className="h-full w-[62%] rounded-full bg-emerald-500" />
                </div>
                <span className="font-semibold">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Growth Stage</span>
                <span className="font-semibold">Vegetative</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Action</span>
                <span className="font-semibold text-emerald-700">Irrigate Today</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence</span>
                <span className="font-semibold text-emerald-700">94%</span>
              </div>
            </div>

            <p className="mt-5 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-center text-xs font-semibold text-amber-900">
              HIGH URGENCY: act within 24 hours
            </p>
          </article>

          <div className="grid grid-cols-2 gap-3">
            {weatherItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center"
              >
                <p className="font-display text-lg font-bold text-zinc-900">{item.symbol}</p>
                <p className="text-sm font-semibold text-zinc-800">{item.value}</p>
                <p className="text-xs text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
