import { MapPin, Plus, Sprout } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';

interface Farm {
  id:        string;
  name:      string;
  location:  string;
  cropType:  string;
  gpsLat:    number;
  gpsLng:    number;
  status:    'pending' | 'analyzed';
  createdAt: string;
}

const mockFarms: Farm[] = [
  { id: '1', name: 'North Field',    location: 'Enugu, Nigeria',   cropType: 'Maize',    gpsLat: 6.4541, gpsLng: 7.5087,  status: 'analyzed', createdAt: '2026-04-20' },
  { id: '2', name: 'River Boundary', location: 'Ibadan, Nigeria',  cropType: 'Cassava',  gpsLat: 7.3775, gpsLng: 3.9470,  status: 'pending',  createdAt: '2026-04-21' },
];

const statusBadge = {
  analyzed: { text: 'Analyzed',  cls: 'bg-emerald-100 text-emerald-700' },
  pending:  { text: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
};
const statusBadgeDark = {
  analyzed: { text: 'Analyzed',  cls: 'bg-emerald-900/40 text-emerald-300' },
  pending:  { text: 'Pending',   cls: 'bg-amber-900/40 text-amber-300' },
};

function FarmSubmitModal({ onClose }: { onClose: () => void }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: '', location: '', cropType: '', gpsLat: '', gpsLng: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to POST /api/farm once farm-service is deployed
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  }

  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${isDark ? 'border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:ring-emerald-600' : 'border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:ring-emerald-500'}`;
  const labelCls = `mb-1 block text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
        <h2 className={`mb-4 font-display text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Submit a New Farm</h2>
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sprout className="h-6 w-6" />
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Farm submitted!</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Analysis will begin shortly. Check recommendations for results.</p>
            <button type="button" onClick={onClose} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className={labelCls}>Farm Name</label><input required className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. North Field" /></div>
            <div><label className={labelCls}>Location / Village</label><input required className={inputCls} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Enugu, Nigeria" /></div>
            <div><label className={labelCls}>Crop Type</label><input required className={inputCls} value={form.cropType} onChange={(e) => setForm((f) => ({ ...f, cropType: e.target.value }))} placeholder="e.g. Maize" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>GPS Latitude</label><input required type="number" step="any" className={inputCls} value={form.gpsLat} onChange={(e) => setForm((f) => ({ ...f, gpsLat: e.target.value }))} placeholder="6.4541" /></div>
              <div><label className={labelCls}>GPS Longitude</label><input required type="number" step="any" className={inputCls} value={form.gpsLng} onChange={(e) => setForm((f) => ({ ...f, gpsLng: e.target.value }))} placeholder="7.5087" /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Farm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function FarmerFarmsPage() {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const badge = isDark ? statusBadgeDark : statusBadge;

  return (
    <DashboardLayout>
      <PageHeader
        title="My Farms"
        subtitle="Manage your registered farms and submit new ones for analysis."
        action={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Farm
          </button>
        }
      />

      {mockFarms.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border py-16 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <Sprout className="h-10 w-10 text-emerald-400" />
          <p className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No farms yet</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Submit your first farm to get started.</p>
          <button type="button" onClick={() => setShowModal(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> New Farm
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockFarms.map((farm) => (
            <div key={farm.id} className={`rounded-2xl border p-5 transition ${isDark ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Sprout className="h-4 w-4" />
                  </div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{farm.name}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[farm.status].cls}`}>{badge[farm.status].text}</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className={`h-3.5 w-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{farm.location}</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crop: <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{farm.cropType}</span></p>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Submitted: {farm.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <FarmSubmitModal onClose={() => setShowModal(false)} />}
    </DashboardLayout>
  );
}
