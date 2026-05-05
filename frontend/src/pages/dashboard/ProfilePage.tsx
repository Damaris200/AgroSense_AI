import { AlertCircle, CheckCircle2, Loader2, UserCircle } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateProfileRequest } from '../../services/profile.service';
import { extractApiError } from '../../services/auth.service';

export function ProfilePage() {
  const { isDark } = useTheme();
  const { user, token, setSession } = useAuth();

  const [name, setName]     = useState(user?.name ?? '');
  const [phone, setPhone]   = useState(user?.phone ?? '');
  const [locale, setLocale] = useState<'en' | 'fr'>(user?.locale ?? 'en');

  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const updated = await updateProfileRequest({ name, phone: phone || undefined, locale });
      setSession({ user: updated, token: token ?? window.localStorage.getItem('agrosense_token') ?? '' });
      setSuccess(true);
    } catch (err) {
      setError(extractApiError(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  }

  const cardBg    = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const labelCl   = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const inputCl   = isDark
    ? 'border-zinc-700 bg-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500'
    : 'border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-emerald-500';

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        subtitle="Update your display name, phone number, and language preference."
      />

      <div className="mx-auto max-w-lg">
        {/* Avatar */}
        <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${cardBg}`}>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <UserCircle className="h-8 w-8" />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.name}</p>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user?.email}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="space-y-4">
            <div>
              <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${labelCl}`}>
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputCl}`}
              />
            </div>

            <div>
              <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${labelCl}`}>
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputCl}`}
              />
            </div>

            <div>
              <label htmlFor="profile-language" className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${labelCl}`}>
                Language
              </label>
              <select
                id="profile-language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'fr')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputCl}`}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {error && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${isDark ? 'border-emerald-900/40 bg-emerald-900/20 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Profile updated successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
