import { Database, Download, RefreshCw } from 'lucide-react';
import { Badge } from './Badge';
import {
  countConsuming,
  countWaiting,
  getPartnerConsumption,
  partnerLabel,
  type PartnerId,
} from '../lib/partnerConsumption';
import { useFlex } from '../store/FlexContext';

const statusVariant = {
  consuming: 'success' as const,
  waiting: 'warning' as const,
  stale: 'info' as const,
  not_published: 'neutral' as const,
};

const statusLabel = {
  consuming: 'Consuming',
  waiting: 'Waiting on publish',
  stale: 'Stale — re-pull',
  not_published: 'Not published',
};

interface PartnerConsumptionPanelProps {
  partner: PartnerId;
  onPull?: () => void;
  pulling?: boolean;
}

export function PartnerConsumptionPanel({ partner, onPull, pulling }: PartnerConsumptionPanelProps) {
  const flex = useFlex();
  const rows = getPartnerConsumption(flex, partner);
  const consuming = countConsuming(flex, partner);
  const waiting = countWaiting(flex, partner);

  return (
    <div className="mt-5 pt-5 border-t border-flex-border/40">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-flex-accent" />
          <h4 className="text-sm font-semibold">Consumes from Flex</h4>
          <Badge variant="success">{consuming} live</Badge>
          {waiting > 0 && <Badge variant="warning">{waiting} waiting</Badge>}
        </div>
        {onPull && (
          <button
            type="button"
            disabled={pulling || consuming === 0}
            title={consuming === 0 ? 'Publish a dataset in Data Exchange first' : 'Simulate partner pulling published data'}
            onClick={onPull}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-flex-accent2/10 text-flex-accent2 border border-flex-accent2/30 hover:bg-flex-accent2/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pulling ? 'animate-spin' : ''}`} />
            Simulate pull
          </button>
        )}
      </div>

      <p className="text-xs text-flex-muted mb-3">
        {partnerLabel(partner)} subscribes to governed datasets Flex publishes outbound. Publish in{' '}
        <span className="text-flex-accent">Data Exchange</span> to deliver.
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.datasetName} className="glass rounded-lg px-3 py-2.5 text-sm flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-xs font-medium">{row.datasetName}</p>
              <p className="text-xs text-flex-muted mt-0.5">{row.purpose}</p>
              {row.schema.length > 0 && (
                <p className="text-[10px] text-flex-muted mt-1 truncate">
                  Schema: {row.schema.slice(0, 4).join(', ')}
                  {row.schema.length > 4 ? '…' : ''}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
              {row.status === 'consuming' && (
                <p className="text-[10px] text-flex-muted mt-1 flex items-center gap-1 justify-end">
                  <Download className="w-3 h-3" />
                  {row.recordCount.toLocaleString()} rows
                </p>
              )}
              {row.lastConsumedAt && (
                <p className="text-[10px] text-flex-muted mt-0.5">
                  {new Date(row.lastConsumedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
