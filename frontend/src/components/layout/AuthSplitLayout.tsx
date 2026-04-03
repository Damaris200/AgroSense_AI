import type { ReactNode } from 'react';

interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelDescription: string;
  panelItems: string[];
  children: ReactNode;
}

export function AuthSplitLayout({
  title,
  subtitle,
  panelTitle,
  panelDescription,
  panelItems,
  children,
}: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-zinc-950 md:grid md:grid-cols-2">
      {/* Left panel - Agriculture themed */}
      <section className="relative hidden overflow-hidden border-r border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-950 p-10 text-white md:flex md:flex-col md:justify-between">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-emerald-800/15 rounded-full blur-3xl animate-pulse delay-1000" />
          
          {/* Farming pattern SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 800 1200">
            <defs>
              <pattern id="farming-field" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="100" y2="0" stroke="#10b981" strokeWidth="0.5" opacity="0.5"/>
                <line x1="0" y1="20" x2="100" y2="20" stroke="#10b981" strokeWidth="0.5" opacity="0.3"/>
                <circle cx="20" cy="30" r="2" fill="#34d399" opacity="0.4"/>
                <circle cx="60" cy="50" r="1.5" fill="#10b981" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="800" height="1200" fill="url(#farming-field)"/>
          </svg>

          {/* Decorative shapes */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 border-2 border-emerald-500/20 rounded-full" />
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-emerald-600/15 rounded-lg" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/50">
              🌾
            </div>
            <div>
              <p className="font-display text-2xl font-bold">
                AgroSense <span className="text-emerald-300">AI</span>
              </p>
              <p className="text-xs text-emerald-200/60">Smart Farming</p>
            </div>
          </div>

          {/* Main message */}
          <div className="space-y-4">
            <h2 className="font-display text-4xl font-black leading-tight bg-gradient-to-r from-emerald-200 to-emerald-100 bg-clip-text text-transparent">
              {panelTitle}
            </h2>
            <p className="text-lg text-emerald-100/80 leading-relaxed">
              {panelDescription}
            </p>
          </div>

          {/* Benefits list */}
          <ul className="space-y-4">
            {panelItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base">
                <div className="flex-shrink-0 mt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 block" />
                </div>
                <span className="text-emerald-100/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer message */}
        <div className="relative z-10 space-y-4 pt-4 border-t border-emerald-900/40">
          <p className="text-sm text-emerald-200/70">
            💚 "AgroSense AI transformed how I manage my maize farm. The recommendations are practical and my yields improved by 40%." 
          </p>
          <p className="text-xs text-emerald-300/60 font-medium">— Farmer from Cameroon</p>
        </div>
      </section>

      {/* Right panel - Form */}
      <section className="flex items-center justify-center bg-white px-4 py-12 md:px-10">
        <div className="w-full max-w-md">
          <div className="space-y-2 mb-8">
            <h1 className="font-display text-4xl font-bold text-zinc-950">{title}</h1>
            <p className="text-base text-zinc-600">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
