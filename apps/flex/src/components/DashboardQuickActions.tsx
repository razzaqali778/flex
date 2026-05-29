import { useNavigate } from 'react-router-dom';
import { Check, RefreshCw, Send, Shield } from 'lucide-react';
import { useFlex } from '../store/FlexContext';

export function DashboardQuickActions() {
  const { pendingCount, dataRequests, publishedDatasets, refreshFromExternal, publishDataset, lastSyncMessage } =
    useFlex();
  const navigate = useNavigate();

  const firstPending = dataRequests.find((r) => r.status === 'pending');
  const anomalyFeed = publishedDatasets.find((d) => d.name === 'anomaly_feed' && d.status === 'draft');

  const hasActions = firstPending || anomalyFeed || true;

  if (!hasActions) return null;

  return (
    <div className="rounded-xl p-3 mb-6 border border-flex-border/40 bg-flex-surface/20">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs font-medium text-flex-muted flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Quick actions
        </p>
        {lastSyncMessage && (
          <p className="text-[11px] text-flex-success truncate max-w-[200px]">{lastSyncMessage}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {firstPending && (
          <button
            type="button"
            onClick={() =>
              navigate('/govern/exchange', { state: { previewRequestId: firstPending.id } })
            }
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-warning/15 text-flex-warning border border-flex-warning/30 hover:bg-flex-warning/25"
          >
            <Check className="w-3.5 h-3.5" />
            Preview approval ({pendingCount})
          </button>
        )}
        {anomalyFeed && (
          <button
            type="button"
            onClick={() => {
              if (publishDataset(anomalyFeed.id)) {
                navigate('/govern/exchange');
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-accent2/15 text-flex-accent2 border border-flex-accent2/30 hover:bg-flex-accent2/25"
          >
            <Send className="w-3.5 h-3.5" />
            Publish anomaly_feed
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            void refreshFromExternal('eztrac');
            navigate('/govern/partners');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-accent/10 text-flex-accent border border-flex-accent/30 hover:bg-flex-accent/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Simulate EzTrac sync
        </button>
      </div>
    </div>
  );
}
