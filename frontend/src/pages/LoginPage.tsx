import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';

type LoginErrors = {
  email?: string;
  password?: string;
  auth?: string;
};

const emailPattern = /\S+@\S+\.\S+/;

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};

    if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1000);
    });

    const isFarmer = email === 'farmer@agrosense.ai' && password === 'farmer123';
    const isAdmin = email === 'admin@agrosense.ai' && password === 'admin123';

    setLoading(false);

    if (isFarmer || isAdmin) {
      navigate('/');
      return;
    }

    setErrors({ auth: 'Invalid credentials. Try demo accounts to test the flow.' });
  };

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="New to AgroSense?"
      panelTitle="Access Your Farm Intelligence"
      panelDescription="Review the latest AI recommendations tailored to your farm's unique conditions and receive real-time weather alerts."
      panelItems={[
        'Latest AI recommendations with confidence scores',
        'Weather forecasts for your specific region',
        'SMS alerts for irrigation and crop warnings',
        'Track your farm history and progress',
      ]}
    >
      <div className="space-y-6">
        {/* Create account link */}
        <p className="text-sm text-zinc-600">
          Don't have an account? 
          <Link to="/register" className="ml-2 font-bold text-emerald-600 hover:text-emerald-700 transition">
            Create one free →
          </Link>
        </p>

        {/* Demo accounts section */}
        <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-6">
          <p className="mb-4 text-sm font-bold text-zinc-800 flex items-center gap-2">
            <span>🧪</span> Try Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="group rounded-lg border-2 border-emerald-300 bg-white px-3 py-3 text-xs font-bold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-600/10"
              onClick={() => fillDemo('farmer@agrosense.ai', 'farmer123')}
            >
              <div className="text-lg mb-1">👨‍🌾</div>
              Farmer Demo
            </button>
            <button
              type="button"
              className="group rounded-lg border-2 border-emerald-300 bg-white px-3 py-3 text-xs font-bold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-600/10"
              onClick={() => fillDemo('admin@agrosense.ai', 'admin123')}
            >
              <div className="text-lg mb-1">📊</div>
              Admin Demo
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Click a button above to auto-fill credentials</p>
        </div>

        {/* Error message */}
        {errors.auth ? (
          <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p className="font-semibold">Sign in failed</p>
            <p className="text-xs mt-1">{errors.auth}</p>
          </div>
        ) : null}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-800">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
              placeholder="you@farm.com"
            />
            {errors.email ? (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <span>⚠️</span> {errors.email}
              </p>
            ) : null}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-800">
                Password
              </label>
              <button 
                type="button" 
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition"
              >
                {showPassword ? '👁️ Hide' : '👁️‍🗨️ Show'}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <span>⚠️</span> {errors.password}
              </p>
            ) : null}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="group-hover:text-zinc-700 transition">Keep me signed in for 7 days</span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-lg hover:shadow-emerald-600/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-r-transparent rounded-full" />
                Signing in...
              </>
            ) : (
              <>
                <span>🔓</span>
                Sign In to My Farm
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-zinc-500">or continue with</span>
            </div>
          </div>

          {/* Alternative login methods */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg border-2 border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition"
            >
              <span className="text-lg">📱</span> SMS Code
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition"
            >
              <span className="text-lg">📧</span> Magic Link
            </button>
          </div>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
