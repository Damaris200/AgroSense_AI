import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PasswordStrength } from '../components/auth/PasswordStrength';
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';

type RegisterErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

const emailPattern = /\S+@\S+\.\S+/;

export function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [success, setSuccess] = useState('');

  const isPhoneProvided = useMemo(() => phone.trim().length > 0, [phone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: RegisterErrors = {};

    if (!firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!emailPattern.test(email.trim())) nextErrors.email = 'Enter a valid email';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) nextErrors.terms = 'You must accept the terms to continue';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1300);
    });

    setLoading(false);
    setSuccess('✅ Account created! Redirecting to sign in...');

    window.setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <AuthSplitLayout
      title="Join AgroSense AI"
      subtitle="Already a member?"
      panelTitle="Transform Your Farming Today"
      panelDescription="Get AI-powered recommendations tailored to your farm's specific conditions and receive alerts right on your phone."
      panelItems={[
        'Soil and weather-based crop recommendations',
        'Real-time SMS alerts even on basic phones',
        'English and French language support',
        'Track progress and improve year after year',
      ]}
    >
      <div className="space-y-6">
        {/* Sign in link */}
        <p className="text-sm text-zinc-600">
          Already have an account?
          <Link to="/login" className="ml-2 font-bold text-emerald-600 hover:text-emerald-700 transition">
            Sign in →
          </Link>
        </p>

        {/* Success message */}
        {success ? (
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p className="font-semibold">{success}</p>
          </div>
        ) : null}

        {/* Language selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`rounded-lg border-2 px-4 py-3 text-sm font-bold transition ${
              language === 'en'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <span className="text-lg mb-1 block">🇬🇧</span>
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            className={`rounded-lg border-2 px-4 py-3 text-sm font-bold transition ${
              language === 'fr'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <span className="text-lg mb-1 block">🇫🇷</span>
            Français
          </button>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-800">
                First Name
              </label>
              <input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
                placeholder="Jean"
              />
              {errors.firstName ? (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.firstName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-800">
                Last Name
              </label>
              <input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
                placeholder="Baptiste"
              />
              {errors.lastName ? (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.lastName}
                </p>
              ) : null}
            </div>
          </div>

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

          {/* Phone field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-zinc-800">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
              placeholder="+237 6XX XXX XXX"
            />
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              {isPhoneProvided ? (
                <>
                  <span>✅</span> SMS alerts will be enabled
                </>
              ) : (
                <>
                  <span>ℹ️</span> Used for weather and irrigation alerts
                </>
              )}
            </p>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
              placeholder="At least 8 characters"
            />
            <PasswordStrength value={password} />
            {errors.password ? (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <span>⚠️</span> {errors.password}
              </p>
            ) : null}
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-800">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border-2 border-zinc-200 px-4 py-3 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder:text-zinc-400"
              placeholder="Repeat your password"
            />
            {errors.confirmPassword ? (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <span>⚠️</span> {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 text-sm text-zinc-600 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="w-5 h-5 rounded border-2 border-zinc-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer mt-0.5"
            />
            <span className="group-hover:text-zinc-700 transition leading-relaxed">
              I agree to the <a href="#" className="font-semibold text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-emerald-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms ? (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.terms}
            </p>
          ) : null}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-lg hover:shadow-emerald-600/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-r-transparent rounded-full" />
                Creating account...
              </>
            ) : (
              <>
                <span>🚀</span>
                Create Free Account
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <span className="text-lg mt-0.5">🔒</span>
          <span>
            Your data is <strong>encrypted end-to-end</strong> and never shared with third parties. Solo farmers trust AgroSense with their sensitive farm data.
          </span>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
