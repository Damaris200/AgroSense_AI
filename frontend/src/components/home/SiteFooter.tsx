export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="relative bg-gradient-to-b from-zinc-950 to-black text-zinc-400 border-t border-emerald-900/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Main footer content */}
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 lg:grid-cols-5 lg:px-8">
          {/* Brand section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-lg">
                🌾
              </div>
              <p className="font-display text-xl font-bold text-white">
                AgroSense <span className="text-emerald-400">AI</span>
              </p>
            </div>
            <p className="text-sm leading-6 text-zinc-500">
              Smart farming support for African growers. Empowering small-scale farmers with practical AI recommendations for better harvests.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="h-10 w-10 rounded-lg bg-emerald-950/50 flex items-center justify-center hover:bg-emerald-900 transition text-emerald-400 font-bold">f</a>
              <a href="#" className="h-10 w-10 rounded-lg bg-emerald-950/50 flex items-center justify-center hover:bg-emerald-900 transition text-emerald-400 font-bold">𝕏</a>
              <a href="#" className="h-10 w-10 rounded-lg bg-emerald-950/50 flex items-center justify-center hover:bg-emerald-900 transition text-emerald-400 font-bold">📧</a>
            </div>
          </div>

          {/* Product column */}
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6">Product</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-zinc-500 transition hover:text-emerald-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#how" className="text-zinc-500 transition hover:text-emerald-400">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#crops" className="text-zinc-500 transition hover:text-emerald-400">
                  Supported Crops
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6">Support</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6">Company</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-500 transition hover:text-emerald-400">
                  Research
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack column */}
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6">Tech Stack</p>
            <p className="text-sm leading-6 text-zinc-500 space-y-1">
              <div>• Bun & TypeScript</div>
              <div>• React & Vite</div>
              <div>• PostgreSQL & Prisma</div>
              <div>• Redis & Kubernetes</div>
              <div>• TensorFlow</div>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800/50" />

        {/* Bottom section */}
        <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <p className="text-xs text-zinc-600">
              © {currentYear} AgroSense AI. All rights reserved. Built with ❤️ for farmers in Africa.
            </p>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <a href="#" className="hover:text-emerald-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-emerald-400 transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-emerald-400 transition">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
