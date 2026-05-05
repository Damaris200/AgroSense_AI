import { AlertCircle, CloudRain, Droplets, Loader2, Thermometer, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { getMyFarms, type Farm } from '../../services/farm.service';
import { getWeatherForFarm, type WeatherRecord } from '../../services/weather.service';
import { extractApiError } from '../../services/auth.service';

function WeatherCard({ record, isDark }: { record: WeatherRecord; isDark: boolean }) {
  const date = new Date(record.fetchedAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const metrics = [
    { icon: <Thermometer className="h-4 w-4" />, label: 'Temperature', value: `${record.temperature.toFixed(1)} °C`, color: 'text-orange-500' },
    { icon: <Droplets className="h-4 w-4" />,    label: 'Humidity',    value: `${record.humidity.toFixed(0)} %`,       color: 'text-sky-500' },
    { icon: <CloudRain className="h-4 w-4" />,   label: 'Rainfall',    value: `${record.rainfall.toFixed(1)} mm/h`,    color: 'text-blue-500' },
    { icon: <Wind className="h-4 w-4" />,        label: 'Wind Speed',  value: `${record.windSpeed.toFixed(1)} m/s`,    color: 'text-emerald-500' },
  ];

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`capitalize text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {record.description}
        </span>
        <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}
          >
            <span className={m.color}>{m.icon}</span>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{m.label}</p>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FarmerWeatherPage() {
  const { isDark } = useTheme();

  const [farms, setFarms]       = useState<Farm[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords]   = useState<WeatherRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

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

  async function loadWeather(farmId: string) {
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherForFarm(farmId);
      setRecords(data);
    } catch (err) {
      setError(extractApiError(err, 'Could not load weather data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFarms();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadWeather(selectedId);
  }, [selectedId]);

  const cardBg   = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const selectCl = isDark
    ? 'border-zinc-700 bg-zinc-800 text-white focus:border-emerald-500'
    : 'border-zinc-200 bg-white text-zinc-900 focus:border-emerald-500';

  return (
    <DashboardLayout>
      <PageHeader
        title="Weather Data"
        subtitle="Historical weather readings fetched at the time each farm was submitted."
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
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-sky-900/30' : 'bg-sky-50'}`}>
            <CloudRain className="h-8 w-8 text-sky-500" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No weather data yet</p>
          <p className={`mt-1 max-w-xs text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Weather data is fetched automatically when you submit a farm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <WeatherCard key={r.id} record={r} isDark={isDark} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
