import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import type { TransferLogEntry } from '../types';
import { Badge } from './Badge';

const appNames: Record<string, string> = {
  flex: 'Flex',
  eztrac: 'EzTrac',
  'dhub-rpt': 'dhub-rpt',
};

const statusVariant = {
  requested: 'warning' as const,
  approved: 'success' as const,
  rejected: 'danger' as const,
  published: 'info' as const,
  delivered: 'success' as const,
};

export function TransferActivity({
  entries,
  limit = 8,
  emptyMessage = 'No transfers yet. Simulate a request on Integrations.',
}: {
  entries: TransferLogEntry[];
  limit?: number;
  emptyMessage?: string;
}) {
  const shown = entries.slice(0, limit);

  if (shown.length === 0) {
    return (
      <div className="glass rounded-xl p-4 text-sm text-flex-muted text-center">{emptyMessage}</div>
    );
  }

  return (
    <ul className="space-y-2">
      {shown.map((e) => (
        <li
          key={e.id}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 rounded-lg bg-flex-surface/50 border border-flex-border/40 text-sm"
        >
          <div className="flex gap-3 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">
              {e.direction === 'inbound' ? (
                <ArrowDownLeft className="w-4 h-4 text-flex-warning" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-flex-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium break-words">{e.message}</p>
              <p className="text-xs text-flex-muted mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <span>
                  {appNames[e.from]} → {appNames[e.to]}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="font-mono break-all">{e.dataset}</span>
                <span>·</span>
                <span>{e.recordCount.toLocaleString()} rows</span>
              </p>
              <p className="text-xs text-flex-muted mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {new Date(e.at).toLocaleString()}
              </p>
            </div>
          </div>
          <Badge variant={statusVariant[e.status]} className="self-start sm:self-center shrink-0">
            {e.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
