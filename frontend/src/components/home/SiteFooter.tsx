import { Globe, Mail, MessageCircle, Send, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../context/ThemeContext';

const quickLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Sign in', to: '/login' },
  { label: 'Register', to: '/register' },
];

const socialLinks = [
  { label: 'AgroSense AI website', href: 'https://agrosense.ai', icon: Globe },
  { label: 'AgroSense AI community channel', href: 'https://wa.me/2348000000000', icon: MessageCircle },
  { label: 'Contact AgroSense AI by email', href: 'mailto:hello@agrosense.ai', icon: Mail },
  { label: 'AgroSense AI updates', href: 'https://t.me/agrosenseai', icon: Send },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const { isDark } = useTheme();

  return (
    <footer className={`transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-white' : 'bg-emerald-950 text-white'}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-bold">AgroSense AI</p>
                <p className="text-sm text-zinc-400">Event-driven advisory for small-scale farming</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              A professional, farmer-centered experience for climate-aware crop guidance, bilingual access, and
              modern agricultural decision support.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Quick links</h2>
              <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-300">
                {quickLinks.map((item) =>
                  item.to ? (
                    <Link key={item.label} to={item.to} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <a key={item.label} href={item.href} className="transition hover:text-white">
                      {item.label}
                    </a>
                  ),
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Connect</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200 transition hover:border-emerald-300/40 hover:text-white"
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-zinc-400">
          <p>Copyright {currentYear} AgroSense AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
