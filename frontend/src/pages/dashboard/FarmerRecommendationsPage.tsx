import { AlertCircle, ChevronDown, ChevronUp, Loader2, Wheat } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { getMyRecommendations, type Recommendation } from '../../services/recommendation.service';
import { extractApiError } from '../../services/auth.service';

function RecommendationCard({ rec, isDark }: { rec: Recommendation; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(rec.generatedAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const truncated   = rec.content.length > 160;
  const displayText = !truncated || expanded ? rec.content : `${rec.content.slice(0, 160)}…`;

  return (
    <div
      className={`rounded-2xl border p-5 transition hover:shadow-sm ${
        isDark ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-100 bg-white hover:border-emerald-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <Wheat className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              AI Recommendation
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {rec.model}
            </span>
          </div>
          <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl border-l-4 border-emerald-500 p-4 ${
          isDark ? 'bg-zinc-800/60' : 'bg-emerald-50'
        }`}
      >
        <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {displayText}
        </p>
        {truncated && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-600'
            }`}
          >
            {expanded
              ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Read more</>}
          </button>
        )}
      </div>
    </div>
  );
}

export function FarmerRecommendationsPage() {
  const { isDark } = useTheme();
  const [recs, setRecs]       = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRecs(await getMyRecommendations());
    } catch (err) {
      setError(extractApiError(err, 'Could not load recommendations.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Recommendations"
        subtitle="Personalised crop advice generated from your farm's weather and soil analysis."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-5 ${
            isDark ? 'border-rose-900/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load recommendations</p>
            <p className="mt-0.5 text-sm opacity-80">{error}</p>
            <button type="button" onClick={load} className="mt-2 text-sm font-semibold underline">
              Retry
            </button>
          </div>
        </div>
      ) : recs.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border py-20 text-center ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
          }`}
        >
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
            }`}
          >
            <Wheat className="h-8 w-8 text-emerald-500" />
          </div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            No recommendations yet
          </p>
          <p className={`mt-1 max-w-xs text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Submit a farm on the My Farms page to trigger weather and soil analysis. Your AI
            recommendation will appear here once processing is complete.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} isDark={isDark} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
