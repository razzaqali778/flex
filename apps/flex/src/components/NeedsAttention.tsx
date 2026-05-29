import { Link, useNavigate } from 'react-router-dom';
import { Check, GitCompareArrows, Send } from 'lucide-react';
import { alignmentScore } from '../data/alignment';
import { useFlex } from '../store/FlexContext';

/** Single dashboard strip: alerts + one-click governance actions (no duplicate quick-action bar). */
export function NeedsAttention() {
  const navigate = useNavigate();
  const { pendingCount, kpis, dataRequests, publishedDatasets, publishDataset } = useFlex();

  const firstPending = dataRequests.find((r) => r.status === 'pending');
  const anomalyFeed = publishedDatasets.find((d) => d.name === 'anomaly_feed' && d.status === 'draft');

  const hasAlerts =
    pendingCount > 0 || kpis.openAnomalies > 0 || alignmentScore < 80;
  const hasActions = Boolean(firstPending || anomalyFeed);

  if (!hasAlerts && !hasActions) return null;

  return (
    <div className="rounded-xl p-4 mb-6 border border-flex-border/40 bg-flex-surface/25 space-y-3">
      {hasAlerts && (
        <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <p className="text-sm font-medium">Needs attention</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {pendingCount > 0 && (
              <Link to="/govern/exchange" className="text-flex-warning hover:underline">
                {pendingCount} approval{pendingCount > 1 ? 's' : ''}
              </Link>
            )}
            {kpis.openAnomalies > 0 && (
              <Link to="/anomalies" className="text-flex-danger hover:underline">
                {kpis.openAnomalies} anomal{kpis.openAnomalies === 1 ? 'y' : 'ies'}
              </Link>
            )}
            {alignmentScore < 80 && (
              <Link
                to="/govern/alignment"
                className="text-flex-accent inline-flex items-center gap-1 hover:underline"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Alignment {alignmentScore}%
              </Link>
            )}
          </div>
        </div>
      )}

      {hasActions && (
        <div className="card-actions pt-1 border-t border-flex-border/30">
          {firstPending && (
            <button
              type="button"
              onClick={() =>
                navigate('/govern/exchange', { state: { previewRequestId: firstPending.id } })
              }
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-warning/15 text-flex-warning border border-flex-warning/30 hover:bg-flex-warning/25"
            >
              <Check className="w-3.5 h-3.5" />
              Review approval
            </button>
          )}
          {anomalyFeed && (
            <button
              type="button"
              onClick={() => {
                if (publishDataset(anomalyFeed.id)) navigate('/govern/exchange');
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-accent2/15 text-flex-accent2 border border-flex-accent2/30 hover:bg-flex-accent2/25"
            >
              <Send className="w-3.5 h-3.5" />
              Publish anomaly_feed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
