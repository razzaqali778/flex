import { Shield, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { buildFieldBoundary, boundarySummary } from '../lib/fieldBoundary';
import type { PublishedDataset } from '../types';

interface FieldBoundaryModalProps {
  dataset: PublishedDataset;
  onConfirm: () => void;
  onClose: () => void;
}

const classColors = {
  public: 'text-flex-success',
  internal: 'text-flex-accent',
  restricted: 'text-flex-warning',
  pii: 'text-flex-danger',
};

export function FieldBoundaryModal({ dataset, onConfirm, onClose }: FieldBoundaryModalProps) {
  const boundaries = buildFieldBoundary(dataset);
  const summary = boundarySummary(boundaries);

  useEscapeKey(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass rounded-2xl border border-flex-accent/30 overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-flex-border/50">
          <div>
            <p className="text-xs text-flex-accent uppercase tracking-wider font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Data boundary preview
            </p>
            <h2 className="font-display font-semibold text-lg mt-0.5">Publish {dataset.name}?</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-flex-muted hover:text-slate-200" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
          {boundaries.map((b) => (
            <div
              key={b.field}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                b.included ? 'border-flex-border/40 bg-flex-surface/30' : 'border-flex-danger/30 bg-flex-danger/5 opacity-70'
              }`}
            >
              <div>
                <p className="font-mono text-sm">{b.field}</p>
                <p className={`text-xs ${classColors[b.classification]}`}>{b.classification}</p>
              </div>
              <span className="text-xs font-medium">{b.included ? 'Included' : 'Excluded'}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-flex-border/40 text-xs text-flex-muted">
          <p>Partners receive: <span className="font-mono text-slate-300">{summary.included.join(', ') || 'none'}</span></p>
          {summary.excluded.length > 0 && (
            <p className="mt-1 text-flex-danger">Blocked: {summary.excluded.join(', ')}</p>
          )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-flex-border/50">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-flex-border/50 text-flex-muted hover:bg-flex-surface/50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-flex-accent2/20 text-flex-accent2 border border-flex-accent2/40 hover:bg-flex-accent2/30 font-medium">
            Confirm publish
          </button>
        </div>
      </div>
    </div>
  );
}

