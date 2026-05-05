import { AlertCircle, Loader2, MapPin, Plus, Sprout, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import {
  getMyFarms,
  submitFarm,
  type Farm,
} from '../../services/farm.service';
import { extractApiError } from '../../services/auth.service';

function StatusBadge({ isDark }: { isDark: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
      }`}
    >
      Processing
    </span>
  );
}

interface ModalProps {
  onClose:  () => void;
  onSaved:  () => void;
  isDark:   boolean;
}

function FarmSubmitModal({ onClose, onSaved, isDark }: ModalProps) {
  const [form, setForm]         = useState({ name: '', location: '', cropType: '', gpsLat: '', gpsLng: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
    isDark
      ? 'border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:ring-emerald-600'
      : 'border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:ring-emerald-500'
  }`;
  const labelCls = `mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitFarm({
        name:     form.name,
        cropType: form.cropType,
        location: form.location,
        gpsLat:   Number(form.gpsLat),
        gpsLng:   Number(form.gpsLng),
      });
      setSubmitted(true);
      onSaved();
    } catch (err) {
      setError(extractApiError(err, 'Submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-100 bg-white'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className={`absolute right-4 top-4 rounded-lg p-1 transition ${
            isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className={`mb-5 font-semibold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Submit a New Farm
        </h2>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Sprout className="h-7 w-7 text-emerald-600" />
            </div>
            <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Farm submitted!
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Analysis will begin shortly. Check Recommendations for results.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className={labelCls}>Farm Name</label>
              <input required className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. North Field" />
            </div>
            <div>
              <label className={labelCls}>Location / Village</label>
              <input required className={inputCls} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Enugu, Nigeria" />
            </div>
            <div>
              <label className={labelCls}>Crop Type</label>
              <input required className={inputCls} value={form.cropType} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))} placeholder="e.g. Maize" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>GPS Latitude</label>
                <input required type="number" step="any" className={inputCls} value={form.gpsLat} onChange={e => setForm(f => ({ ...f, gpsLat: e.target.value }))} placeholder="6.4541" />
              </div>
              <div>
                <label className={labelCls}>GPS Longitude</label>
                <input required type="number" step="any" className={inputCls} value={form.gpsLng} onChange={e => setForm(f => ({ ...f, gpsLng: e.target.value }))} placeholder="7.5087" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                  isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Farm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FarmCard({ farm, isDark }: { farm: Farm; isDark: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 transition hover:shadow-md ${
        isDark ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-100 bg-white hover:border-emerald-100 hover:shadow-emerald-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <Sprout className="h-4 w-4" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {farm.name || farm.cropType}
          </p>
        </div>
        <StatusBadge isDark={isDark} />
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin className={`h-3.5 w-3.5 shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{farm.location}</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Crop: <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{farm.cropType}</span>
        </p>
        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          GPS: {farm.gpsLat.toFixed(4)}, {farm.gpsLng.toFixed(4)}
        </p>
        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Submitted: {new Date(farm.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export function FarmerFarmsPage() {
  const { isDark } = useTheme();
  const [farms, setFarms]         = useState<Farm[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setFarms(await getMyFarms());
    } catch (err) {
      setError(extractApiError(err, 'Could not load farms.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="My Farms"
        subtitle="Manage your registered farms and submit new ones for AI analysis."
        action={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Farm
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className={`flex items-start gap-3 rounded-2xl border p-5 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load farms</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
            <button type="button" onClick={load} className="mt-2 text-sm font-semibold underline">
              Retry
            </button>
          </div>
        </div>
      ) : farms.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border py-20 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
            <Sprout className="h-8 w-8 text-emerald-500" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No farms yet</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Submit your first farm to get AI-powered crop recommendations.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Submit a Farm
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} isDark={isDark} />
          ))}
        </div>
      )}

      {showModal && (
        <FarmSubmitModal
          isDark={isDark}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); void load(); }}
        />
      )}
    </DashboardLayout>
  );
}
