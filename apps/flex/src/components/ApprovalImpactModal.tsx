import { ArrowRight, GitCompareArrows, Sparkles, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { ApprovalImpact } from '../lib/approvalImpact';
import type { DataRequest } from '../types';

interface ApprovalImpactModalProps {
  request: DataRequest;
  impact: ApprovalImpact;
  onConfirm: () => void;
  onClose: () => void;
}

function fmtUsd(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;
}

function Delta({
  before,
  after,
  format = (v: number) => String(v),
  invert = false,
}: {
  before: number;
  after: number;
  format?: (v: number) => string;
  invert?: boolean;
}) {
  const delta = after - before;
  const improved = invert ? delta < 0 : delta > 0;
  const neutral = delta === 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-flex-muted">{format(before)}</span>
      <ArrowRight className="w-3.5 h-3.5 text-flex-muted shrink-0" />
      <span
        className={`font-semibold ${
          neutral ? 'text-slate-200' : improved ? 'text-flex-success' : 'text-flex-warning'
        }`}
      >
        {format(after)}
      </span>
      {!neutral &&
        (improved ? (
          <TrendingUp className="w-3.5 h-3.5 text-flex-success" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-flex-warning" />
        ))}
    </div>
  );
}

export function ApprovalImpactModal({
  request,
  impact,
  onConfirm,
  onClose,
}: ApprovalImpactModalProps) {
  useEscapeKey(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass rounded-2xl border border-flex-accent/30 overflow-hidden animate-scale-in shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="impact-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-flex-border/50">
          <div>
            <p className="text-xs text-flex-accent uppercase tracking-wider font-medium">
              Impact preview
            </p>
            <h2 id="impact-title" className="font-display font-semibold text-lg mt-0.5">
              Approve {impact.dataset}?
            </h2>
            <p className="text-sm text-flex-muted mt-1">
              From {impact.partnerLabel} · {impact.recordCount.toLocaleString()} records
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-flex-muted hover:text-slate-200 hover:bg-flex-surface/50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl p-4 bg-flex-accent/5 border border-flex-accent/20 flex gap-3">
            <Sparkles className="w-5 h-5 text-flex-accent shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200 leading-relaxed">{impact.aiSummary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-flex-surface/40 border border-flex-border/40">
              <p className="text-xs text-flex-muted uppercase tracking-wider mb-2">
                Pending approvals
              </p>
              <Delta
                before={impact.kpiBefore.pendingApprovals}
                after={impact.kpiAfter.pendingApprovals}
                invert
              />
            </div>
            <div className="rounded-xl p-4 bg-flex-surface/40 border border-flex-border/40">
              <p className="text-xs text-flex-muted uppercase tracking-wider mb-2">Utilization</p>
              <Delta
                before={impact.kpiBefore.utilization}
                after={impact.kpiAfter.utilization}
                format={(v) => `${v}%`}
              />
            </div>
            <div className="rounded-xl p-4 bg-flex-surface/40 border border-flex-border/40">
              <p className="text-xs text-flex-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <GitCompareArrows className="w-3.5 h-3.5" />
                Alignment score
              </p>
              <Delta
                before={impact.alignmentBefore}
                after={impact.alignmentAfter}
                format={(v) => `${v}%`}
              />
            </div>
            <div className="rounded-xl p-4 bg-flex-surface/40 border border-flex-border/40">
              <p className="text-xs text-flex-muted uppercase tracking-wider mb-2">Monthly spend</p>
              <Delta
                before={impact.kpiBefore.totalSpend}
                after={impact.kpiAfter.totalSpend}
                format={fmtUsd}
                invert
              />
            </div>
          </div>

          {impact.staleDatasets.length > 0 && (
            <div className="rounded-xl p-3 border border-flex-warning/30 bg-flex-warning/5 text-sm">
              <p className="font-medium text-flex-warning">Downstream refresh needed</p>
              <p className="text-flex-muted mt-1 text-xs">
                These published datasets may be stale after ingest:{' '}
                <span className="font-mono text-slate-300">{impact.staleDatasets.join(', ')}</span>
              </p>
            </div>
          )}

          <p className="text-xs text-flex-muted">{request.purpose}</p>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-flex-border/50 bg-flex-bg/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-flex-muted border border-flex-border/50 hover:bg-flex-surface/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-flex-success/20 text-flex-success border border-flex-success/40 hover:bg-flex-success/30"
          >
            Confirm & transfer
          </button>
        </div>
      </div>
    </div>
  );
}
