import { Link } from 'react-router-dom';

export function CtaBanner() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />

        {/* Animated farming pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: '#fff', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M0,200 Q360,100 720,200 T1440,200" stroke="url(#grad1)" strokeWidth="2" fill="none" />
          <path d="M0,250 Q360,150 720,250 T1440,250" stroke="url(#grad1)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 text-center lg:px-8 space-y-8">
        {/* Main heading */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-bold text-white">Join the Agricultural Revolution</span>
          </div>

          <h2 className="font-display text-5xl md:text-6xl font-black text-white leading-tight">
            Ready to farm <span className="bg-gradient-to-r from-yellow-100 to-white bg-clip-text text-transparent">smarter?</span>
          </h2>

          <p className="mx-auto max-w-3xl text-lg md:text-xl text-white/90 leading-relaxed">
            Join thousands of farmers already using AgroSense AI to make better decisions, reduce waste, increase yields, and boost their bottom line. Get started in minutes.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-600 shadow-2xl shadow-black/20 transition hover:shadow-2xl hover:shadow-black/30 hover:scale-105 hover:-translate-y-1"
          >
            <span>Create Your Free Account</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-8 py-3.5 text-base font-bold text-white hover:bg-white/10 transition backdrop-blur"
          >
            <span>Watch a Demo</span>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 space-y-3">
          <p className="text-white/90 font-medium">✓ Completely Free • ✓ SMS Support • ✓ Bilingual (EN/FR)</p>
          <p className="text-white/70 text-sm">
            🔒 Your data is encrypted and secure • 🌍 Works across Africa • 📱 Works on any phone
          </p>
        </div>
      </div>
    </section>
  );
}
