import { Link } from 'react-router-dom';

import { processSteps } from '../../data/content';

const stepEmojis = ['📝', '📊', '⚙️', '✅'];

export function HowItWorksSection() {
  return (
    <section id="how" className="relative py-24 bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-tl from-emerald-100/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mb-16 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-600" />
            Simple Process
            <span className="h-1 w-1 rounded-full bg-emerald-600" />
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-black text-zinc-950">
            From farm data to <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">AI advice in seconds</span>
          </h2>
          <p className="max-w-2xl text-lg text-zinc-600">
            A straightforward four-step process designed for speed and clarity, perfect for farmers even with low bandwidth connections.
          </p>
        </div>

        {/* Steps Container */}
        <div className="space-y-6 md:space-y-0">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative group">
                {/* Connecting line for desktop */}
                {index < processSteps.length - 1 && (
                  <div className="hidden xl:block absolute top-24 -right-6 w-12 h-0.5 bg-gradient-to-r from-emerald-400/80 to-emerald-300/50 group-hover:to-emerald-400 transition-all" />
                )}

                {/* Card */}
                <div className="relative rounded-2xl border-2 border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 p-8 transition-all hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-600/15 hover:-translate-y-2 h-full">
                  {/* Hover background glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-emerald-50/50 to-transparent" />

                  <div className="relative space-y-4">
                    {/* Step number circle */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-2xl font-bold text-white shadow-lg shadow-emerald-600/30 group-hover:scale-110 group-hover:shadow-emerald-600/50 transition-all">
                      {stepEmojis[index]}
                    </div>

                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      Step {index + 1}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-display text-xl font-bold text-zinc-900 group-hover:text-emerald-700 transition">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-zinc-600 group-hover:text-zinc-700 transition">
                        {step.description}
                      </p>
                    </div>

                    {/* Bottom indicator line */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block xl:hidden pt-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-emerald-300 text-emerald-600 font-bold">
                          ↓
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline info for mobile */}
        <div className="mt-12 md:hidden space-y-3 text-center">
          {processSteps.map((_, index) => (
            index < processSteps.length - 1 && (
              <div key={index} className="flex items-center justify-center">
                <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-400/20" />
              </div>
            )
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur p-14 text-center space-y-6">
          <div>
            <h3 className="font-display text-4xl font-bold text-zinc-950 mb-3">Ready to get started?</h3>
            <p className="max-w-2xl mx-auto text-lg text-zinc-700">
              Create your free account in under 2 minutes. No credit card required. Start receiving AI recommendations for your farm today.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-9 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 transition hover:shadow-emerald-600/50 hover:scale-105 hover:-translate-y-1"
          >
            <span>Start Your First Analysis</span>
            <span>→</span>
          </Link>
          <p className="text-sm text-zinc-600 font-medium">
            ✓ Free forever • ✓ No code needed • ✓ Works on any phone
          </p>
        </div>
      </div>
    </section>
  );
}
