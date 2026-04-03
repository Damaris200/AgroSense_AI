import { featureItems } from '../../data/content';

const featureEmojis: { [key: string]: string } = {
  'AI': '🤖',
  'WX': '🌤️',
  'SMS': '📱',
  'EV': '⚡',
  'FR/EN': '🌍',
  'BI': '📊'
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-zinc-950 via-emerald-950/20 to-zinc-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-emerald-950/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mb-16 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Why AgroSense AI
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
          </p>
          <h2 className="max-w-3xl font-display text-5xl md:text-6xl font-black leading-tight text-white">
            Everything a farmer needs, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">powered by AI</span>
          </h2>
          <p className="max-w-2xl text-lg text-emerald-100/80">
            Designed for small-scale farming operations across Africa. Get practical recommendations without technical complexity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureItems.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-zinc-900/60 p-8 backdrop-blur-sm transition-all hover:border-emerald-500/60 hover:bg-gradient-to-br hover:from-emerald-950/60 hover:to-zinc-900/40 hover:shadow-2xl hover:shadow-emerald-600/20 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative space-y-4">
                {/* Icon */}
                <div className="inline-flex rounded-xl border border-emerald-900/60 bg-gradient-to-br from-emerald-900/40 to-emerald-950/20 px-4 py-3 text-3xl group-hover:border-emerald-500/40 group-hover:shadow-lg group-hover:shadow-emerald-600/20 transition-all">
                  {featureEmojis[feature.icon] || '✨'}
                </div>

                {/* Title and description */}
                <div>
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-emerald-300 transition">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-emerald-100/70 group-hover:text-emerald-100/90 transition">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="pt-4 mt-2 border-t border-emerald-900/30 group-hover:border-emerald-500/30 transition">
                  <div className="h-0.5 w-0 bg-gradient-to-r from-emerald-500 to-transparent group-hover:w-12 transition-all duration-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-emerald-200/80 font-medium mb-4">All features included in your free account</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-emerald-900/40 bg-emerald-950/20 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-300">No payment details needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
