import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Presentation, X } from 'lucide-react';
import { MEETING_STEPS, meetingProgress, type MeetingContext } from '../lib/meetingMode';
import { useFlex } from '../store/FlexContext';

interface MeetingModeBannerProps {
  onDismiss?: () => void;
}

export function MeetingModeBanner({ onDismiss }: MeetingModeBannerProps) {
  const flex = useFlex();

  const ctx: MeetingContext = {
    pendingCount: flex.pendingCount,
    openAnomalies: flex.kpis.openAnomalies,
    hasApprovedRequest: flex.dataRequests.some((r) => r.status === 'approved'),
    hasPublishedDraft: flex.publishedDatasets.some(
      (d) => d.name === 'anomaly_feed' && d.status === 'active'
    ),
    hasResolvedAnomaly: flex.anomalies.some((a) => a.status === 'resolved'),
    alignmentScore: flex.alignmentScore,
  };

  const progress = meetingProgress(ctx);

  if (!flex.settings.meetingMode) return null;

  return (
    <div className="mx-4 mt-3 mb-1 glass rounded-xl border border-flex-accent2/30 overflow-hidden shrink-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-flex-accent2/10 border-b border-flex-accent2/20">
        <div className="flex items-center gap-2 min-w-0">
          <Presentation className="w-4 h-4 text-flex-accent2 shrink-0" />
          <span className="text-sm font-medium truncate">Meeting mode · {progress}% complete</span>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="p-1 text-flex-muted hover:text-slate-200" aria-label="Hide">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="h-1 bg-flex-border/40">
        <div className="h-full bg-flex-accent2 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <ol className="px-4 py-3 space-y-2 text-sm max-h-40 overflow-y-auto">
        {MEETING_STEPS.map((step) => {
          const done = step.check(ctx);
          return (
            <li key={step.id} className="flex items-start gap-2">
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-flex-success shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-flex-muted shrink-0 mt-0.5" />
              )}
              <span className={done ? 'text-flex-muted line-through' : ''}>
                <Link to={step.route} className="hover:text-flex-accent">
                  {step.label}
                </Link>
                <span className="block text-xs text-flex-muted">{step.hint}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

