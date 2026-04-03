import { Link } from 'react-router-dom';

import { navItems } from '../../data/content';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-200/40 bg-white/80 backdrop-blur-2xl shadow-lg shadow-emerald-950/5">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50 transition-all">
            <span className="text-lg">🌾</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-zinc-900">
              AgroSense <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="text-xs text-emerald-600 font-medium">Smart Farming</span>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium text-zinc-600 transition hover:text-emerald-600 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-zinc-700 sm:inline-block hover:text-emerald-600 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-emerald-600/50 hover:scale-105 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
