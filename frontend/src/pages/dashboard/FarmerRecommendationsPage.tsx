import { ChevronDown, ChevronUp, Wheat } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useTheme } from '../../context/ThemeContext';

interface Recommendation {
  id:             string;
  farmName:       string;
  cropType:       string;
  recommendation: string;
  generatedAt:    string;
}

const mockRecommendations: Recommendation[] = [
  {
    id:             '1',
    farmName:       'North Field',
    cropType:       'Maize',
    recommendation: 'Irrigate within the next 24 hours. Current soil moisture is at 22% — well below the optimal 40–60% range for maize. Low rainfall probability (8%) over the next 3 days means natural replenishment is unlikely. Apply approximately 25mm of water evenly across the field.',
    generatedAt:    '2026-04-21T08:30:00.000Z',
  },
  {
    id:             '2',
    farmName:       'North Field',
    cropType:       'Maize',
    recommendation: 'Apply phosphorus-rich fertiliser before the expected rainfall on April 18. Soil analysis indicates low phosphorus levels (12 mg/kg) which will limit root development in the current growth stage. Apply 30 kg/ha of DAP to maximise uptake during rain.',
    generatedAt:    '2026-04-18T14:15:00.000Z',
  },
  {
    id:             '3',
    farmName:       'River Boundary',
    cropType:       'Cassava',
    recommendation: 'Conditions are favourable for planting. Soil pH is at 6.1 which is ideal for cassava. Ensure planting stakes are set 30 cm deep to maximise rooting. Avoid over-watering — soil moisture is already at 58% due to recent rainfall.',
    generatedAt:    '2026-04-21T10:00:00.000Z',
  },
];

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const date = new Date(rec.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const truncated = rec.recommendation.length > 120;
  const displayText = !truncated || expanded ? rec.recommendation : `${rec.recommendation.slice(0, 120)}…`;

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
          <Wheat className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{rec.farmName}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>{rec.cropType}</span>
          </div>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{date}</p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border-l-4 border-emerald-500 p-4 ${isDark ? 'bg-zinc-800/60' : 'bg-emerald-50'}`}>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{displayText}</p>
        {truncated && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-600'}`}
          >
            {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Read more</>}
          </button>
        )}
      </div>
    </div>
  );
}

export function FarmerRecommendationsPage() {
  const { isDark } = useTheme();

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Recommendations"
        subtitle="Personalised crop advice generated from your farm's weather and soil analysis."
      />

      {mockRecommendations.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border py-16 text-center ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
          <Wheat className="h-10 w-10 text-emerald-400" />
          <p className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>No recommendations yet</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Submit a farm to trigger an analysis and receive your first recommendation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
