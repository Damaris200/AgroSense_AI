import { AlertCircle, FlaskConical, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { getMyFarms, type Farm } from '../../services/farm.service';
import { getSoilForFarm, type SoilRecord } from '../../services/soil.service';
import { extractApiError } from '../../services/auth.service';

function SoilBar({ label, value, max, unit, color, isDark }: {
  label: string; value: number; max: number; unit: string; color: string; isDark: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{label}</span>
        <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SoilCard({ record, isDark }: { record: SoilRecord; isDark: boolean }) {
  const date = new Date(record.analyzedAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
          <FlaskConical className="h-4 w-4" />
        </div>
        <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</span>
      </div>
      <div className="space-y-3">
        <SoilBar label="pH"         value={record.ph}         max={14}  unit=""     color="bg-amber-500"   isDark={isDark} />
        <SoilBar label="Moisture"   value={record.moisture}   max={100} unit="%"    color="bg-sky-500"     isDark={isDark} />
        <SoilBar label="Nitrogen"   value={record.nitrogen}   max={300} unit="mg/L" color="bg-emerald-500" isDark={isDark} />
        <SoilBar label="Phosphorus" value={record.phosphorus} max={120} unit="mg/L" color="bg-violet-500"  isDark={isDark} />
        <SoilBar label="Potassium"  value={record.potassium}  max={400} unit="mg/L" color="bg-rose-500"    isDark={isDark} />
      </div>
    </div>
  );
}

export function FarmerSoilPage() {
  const { isDark } = useTheme();

  const [farms, setFarms]           = useState<Farm[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords]       = useState<SoilRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  async function loadFarms() {
    try {
      const data = await getMyFarms();
      setFarms(data);
      if (data.length > 0) setSelectedId(data[0]!.id);
    } catch (err) {
      setError(extractApiError(err, 'Could not load farms.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadSoil(farmId: string) {
    setLoading(true);
    setError('');
    try {
      const data = await getSoilForFarm(farmId);
      setRecords(data);
    } catch (err) {
      setError(extractApiError(err, 'Could not load soil data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFarms();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadSoil(selectedId);
  }, [selectedId]);

  const cardBg   = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const selectCl = isDark
    ? 'border-zinc-700 bg-zinc-800 text-white focus:border-emerald-500'
    : 'border-zinc-200 bg-white text-zinc-900 focus:border-emerald-500';

  return (
    <DashboardLayout>
      <PageHeader
        title="Soil Analysis"
        subtitle="Simulated soil readings (pH, moisture, NPK) collected when your farm was analysed."
      />

      {farms.length > 0 && (
        <div className="mb-6">
          <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Select farm
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${selectCl}`}
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name || f.location} ({f.cropType})</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className={`flex items-start gap-3 rounded-2xl border p-5 ${isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border py-20 text-center ${cardBg}`}>
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
            <FlaskConical className="h-8 w-8 text-emerald-500" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No soil data yet</p>
          <p className={`mt-1 max-w-xs text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Soil analysis runs automatically when you submit a farm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <SoilCard key={r.id} record={r} isDark={isDark} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
