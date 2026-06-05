import { AlertCircle, Loader2, MapPin, Plus, Search, Sprout, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useTheme } from '@/context/ThemeContext';
import {
  getMyFarms,
  submitFarm,
  type Farm,
} from '@/services/farm.service';
import { extractApiError } from '@/services/auth.service';

interface LocationResult {
  label: string;
  lat:   number;
  lon:   number;
}

async function searchLocations(query: string): Promise<LocationResult[]> {
  if (query.trim().length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return [];
  const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map(r => ({
    label: r.display_name,
    lat:   parseFloat(r.lat),
    lon:   parseFloat(r.lon),
  }));
}

function StatusBadge({ isDark, status }: { readonly isDark: boolean; readonly status?: string }) {
  const isCompleted = (status ?? 'processing') === 'completed';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isCompleted ? (isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700')}`}>
      {isCompleted ? 'Completed' : 'Processing'}
    </span>
  );
}

interface LocationSearchProps {
  readonly isDark:   boolean;
  readonly inputCls: string;
  readonly labelCls: string;
  readonly onSelect: (result: LocationResult) => void;
}

function LocationSearch({ isDark, inputCls, labelCls, onSelect }: LocationSearchProps) {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected,  setSelected]  = useState<LocationResult | null>(null);
  const [open,      setOpen]      = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    setSelected(null);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchLocations(val)); }
      finally { setSearching(false); }
    }, 400);
  }

  function handleSelect(r: LocationResult) {
    setSelected(r);
    setQuery(r.label.split(',').slice(0, 2).join(',').trim());
    setResults([]);
    setOpen(false);
    onSelect(r);
  }

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor="farm-location" className={labelCls}>
        Location <span className="font-normal opacity-60">(village, town or city)</span>
      </label>
      <div className="relative">
        <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        <input
          id="farm-location"
          required
          autoComplete="off"
          className={`${inputCls} pl-9`}
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="e.g. Bafoussam, Cameroon"
        />
        {searching && <Loader2 className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />}
        {selected && !searching && <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />}
      </div>
      {open && results.length > 0 && (
        <ul className={`absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(r)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs transition ${isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-emerald-50 text-zinc-700'}`}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span className="line-clamp-2">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>📍 Coordinates resolved automatically</p>}
    </div>
  );
}

const CROP_OPTIONS = [
  'Maize','Cassava','Rice','Tomato','Yam','Cocoa','Coffee',
  'Plantain','Groundnut','Sorghum','Millet','Soybean',
  'Cowpea','Sweet Potato','Banana','Pepper','Onion','Other',
];

interface ModalProps {
  readonly onClose: () => void;
  readonly onSaved: () => void;
  readonly isDark:  boolean;
}

function FarmSubmitModal({ onClose, onSaved, isDark }: ModalProps) {
  const [form, setForm] = useState({ name: '', cropType: '', gpsLat: 0, gpsLng: 0, location: '', soilColor: '', soilTexture: '', soilMoisture: '' });
  const [locationSet, setLocationSet] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');

  const inputCls = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-offset-1 ${
    isDark
      ? 'border-zinc-700 bg-zinc-800/80 text-white placeholder-zinc-500 focus:border-emerald-600 focus:ring-emerald-600/40 focus:ring-offset-zinc-900'
      : 'border-zinc-300 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/30 focus:ring-offset-white'
  }`;
  const labelCls = `mb-1.5 block text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`;

  function handleLocationSelect(r: LocationResult) {
    setForm(f => ({ ...f, location: r.label.split(',').slice(0, 3).join(',').trim(), gpsLat: r.lat, gpsLng: r.lon }));
    setLocationSet(true);
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!locationSet) { setError('Please select a location from the dropdown suggestions.'); return; }
    if (!form.soilColor || !form.soilTexture || !form.soilMoisture) { setError('Please fill in all soil observation fields.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await submitFarm({ name: form.name, cropType: form.cropType, location: form.location, gpsLat: form.gpsLat, gpsLng: form.gpsLng, soilColor: form.soilColor, soilTexture: form.soilTexture, soilMoisture: form.soilMoisture });
      setSubmitted(true);
    } catch (err) {
      setError(extractApiError(err, 'Submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" type="button" aria-label="Close modal" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md overflow-y-auto max-h-[90vh] rounded-2xl border shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
        <button type="button" onClick={onClose} aria-label="Close modal" className={`absolute right-4 top-4 rounded-lg p-1.5 transition ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}>
          <X className="h-4 w-4" />
        </button>
        <div className={`flex items-center gap-3 border-b px-6 py-5 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Register a New Farm</h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>We&apos;ll fetch live weather &amp; soil data, then generate AI crop advice.</p>
          </div>
        </div>
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Sprout className="h-7 w-7 text-emerald-600" />
              </div>
              <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Farm submitted!</p>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Analysis is running. You&apos;ll receive an email when your AI recommendations are ready. Check the <strong>Recommendations</strong> tab for results.
              </p>
              <button type="button" onClick={() => { onSaved(); onClose(); }} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <div>
                <label htmlFor="farm-name" className={labelCls}>Farm Name</label>
                <input id="farm-name" required className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. North Field" />
              </div>
              <LocationSearch isDark={isDark} inputCls={inputCls} labelCls={labelCls} onSelect={handleLocationSelect} />
              <div>
                <label htmlFor="farm-crop-type" className={labelCls}>Crop Type</label>
                <select id="farm-crop-type" required className={inputCls} value={form.cropType} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}>
                  <option value="" disabled>Select a crop…</option>
                  {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={`rounded-xl border px-3.5 py-3 ${isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-50'}`}>
                <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Soil Observations</p>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="soil-color" className={labelCls}>Soil Colour</label>
                    <select id="soil-color" required className={inputCls} value={form.soilColor} onChange={e => setForm(f => ({ ...f, soilColor: e.target.value }))}>
                      <option value="" disabled>Select colour…</option>
                      <option value="red">Red — laterite/iron-rich</option>
                      <option value="brown">Brown — general topsoil</option>
                      <option value="black">Black — high organic matter</option>
                      <option value="grey">Grey — poorly drained</option>
                      <option value="yellow">Yellow — leached/acidic</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="soil-texture" className={labelCls}>Soil Texture</label>
                    <select id="soil-texture" required className={inputCls} value={form.soilTexture} onChange={e => setForm(f => ({ ...f, soilTexture: e.target.value }))}>
                      <option value="" disabled>Select texture…</option>
                      <option value="sandy">Sandy — gritty, drains fast</option>
                      <option value="loamy">Loamy — soft, crumbly, ideal</option>
                      <option value="clayey">Clayey — sticky, holds water</option>
                      <option value="silty">Silty — smooth, moderate drainage</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="soil-moisture" className={labelCls}>Current Moisture Feel</label>
                    <select id="soil-moisture" required className={inputCls} value={form.soilMoisture} onChange={e => setForm(f => ({ ...f, soilMoisture: e.target.value }))}>
                      <option value="" disabled>Select moisture…</option>
                      <option value="dry">Dry — dusty, no moisture felt</option>
                      <option value="moist">Moist — damp but not wet</option>
                      <option value="wet">Wet — water visible or soil sticks heavily</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl border px-3.5 py-3 text-xs ${isDark ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-300' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                <p className="font-semibold mb-0.5">What happens next?</p>
                <p className="opacity-80 leading-relaxed">We automatically fetch real-time weather and soil data for your location, then our AI generates personalised fertiliser, irrigation and pest-risk recommendations. You&apos;ll receive a summary by email.</p>
              </div>
              <div className={`flex gap-3 border-t pt-4 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <button type="button" onClick={onClose} className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>Cancel</button>
                <button type="submit" disabled={submitting || !locationSet} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Farm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FarmCard({ farm, isDark }: { readonly farm: Farm; readonly isDark: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 transition hover:shadow-md ${isDark ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-100 bg-white hover:border-emerald-100 hover:shadow-emerald-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <Sprout className="h-4 w-4" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{farm.name || farm.cropType}</p>
        </div>
        <StatusBadge isDark={isDark} status={farm.status} />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin className={`h-3.5 w-3.5 shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{farm.location}</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crop: <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{farm.cropType}</span></p>
        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Submitted: {new Date(farm.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

export function FarmerFarmsPage() {
  const { isDark } = useTheme();
  const [farms,     setFarms]     = useState<Farm[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try { setFarms(await getMyFarms()); }
    catch (err) { setError(extractApiError(err, 'Could not load farms.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  let content: ReactNode;
  if (loading) {
    content = <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  } else if (error) {
    content = (
      <div className={`flex items-start gap-3 rounded-2xl border p-5 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Unable to load farms</p>
          <p className="mt-0.5 text-sm opacity-80">{error}</p>
          <button type="button" onClick={load} className="mt-2 text-sm font-semibold underline">Retry</button>
        </div>
      </div>
    );
  } else if (farms.length === 0) {
    content = (
      <div className={`flex flex-col items-center justify-center rounded-2xl border py-20 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
          <Sprout className="h-8 w-8 text-emerald-500" />
        </div>
        <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No farms yet</p>
        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Submit your first farm to get AI-powered crop recommendations.</p>
        <button type="button" onClick={() => setShowModal(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Submit a Farm
        </button>
      </div>
    );
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {farms.map((farm) => <FarmCard key={farm.id} farm={farm} isDark={isDark} />)}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Farms"
        subtitle="Manage your registered farms and submit new ones for AI analysis."
        action={
          <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95">
            <Plus className="h-4 w-4" /> New Farm
          </button>
        }
      />
      {content}
      {showModal && <FarmSubmitModal isDark={isDark} onClose={() => setShowModal(false)} onSaved={() => { void load(); }} />}
    </DashboardLayout>
  );
}
