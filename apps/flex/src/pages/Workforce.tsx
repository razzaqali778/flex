import { Link } from 'react-router-dom';
import { Check, GitCompareArrows, UserPlus, Users, ArrowRightLeft, Zap } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { useFlex } from '../store/FlexContext';
import type { WorkforceSignal } from '../data/workforce';

const signalVariant: Record<WorkforceSignal, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  hire: 'info',
  reallocate: 'warning',
  stable: 'success',
  optimize: 'neutral',
};

const signalIcon: Record<WorkforceSignal, typeof Users> = {
  hire: UserPlus,
  reallocate: ArrowRightLeft,
  stable: Users,
  optimize: Zap,
};

function fmtUsd(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;
}

export function Workforce() {
  const { workforce, acknowledgeWorkforceSignal } = useFlex();
  const hiringSignals = workforce.filter((r) => r.signal === 'hire').length;
  const reallocateSignals = workforce.filter((r) => r.signal === 'reallocate').length;

  return (
    <div className="page-shell">
      <PageHeader
        title="Workforce × Infrastructure"
        description="Acknowledge hiring and reallocate signals — synced with dhub-rpt planning."
      />

      <div className="stat-grid">
        <div className="stat-card border-flex-accent">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Squads tracked</p>
          <p className="font-display text-3xl font-bold mt-1">{workforce.length}</p>
        </div>
        <div className="stat-card border-flex-accent2">
          <p className="text-xs text-flex-muted uppercase tracking-wider flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> Hiring signals
          </p>
          <p className="font-display text-3xl font-bold mt-1">{hiringSignals}</p>
        </div>
        <div className="stat-card border-flex-warning">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Reallocate signals</p>
          <p className="font-display text-3xl font-bold mt-1">{reallocateSignals}</p>
        </div>
      </div>

      <div className="space-y-4">
        {workforce.map((row) => {
          const Icon = signalIcon[row.signal];
          return (
            <div key={row.id} className="glass rounded-2xl p-5 shadow-card">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{row.squad}</h3>
                    <Badge variant={signalVariant[row.signal]}>{row.signal}</Badge>
                  </div>
                  <p className="text-sm text-flex-muted mt-1">{row.platformLead} · Lead capacity owner</p>
                </div>
                <div className="card-actions sm:justify-end">
                  {row.signal !== 'stable' && (
                    <button
                      type="button"
                      onClick={() => acknowledgeWorkforceSignal(row.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-flex-success/15 text-flex-success border border-flex-success/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Acknowledge
                    </button>
                  )}
                  <span className="inline-flex items-center gap-2 text-flex-accent text-sm font-medium capitalize px-2">
                    <Icon className="w-5 h-5" />
                    {row.signal} signal
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl p-3 bg-flex-surface/40">
                  <p className="text-[10px] text-flex-muted uppercase">Headcount</p>
                  <p className="text-xl font-bold">{row.headcount}</p>
                </div>
                <div className="rounded-xl p-3 bg-flex-surface/40">
                  <p className="text-[10px] text-flex-muted uppercase">dhub capacity</p>
                  <p className="text-xl font-bold">{row.capacityUsedPct}%</p>
                </div>
                <div className="rounded-xl p-3 bg-flex-surface/40">
                  <p className="text-[10px] text-flex-muted uppercase">Cloud / mo</p>
                  <p className="text-xl font-bold">{fmtUsd(row.cloudCostMonthly)}</p>
                </div>
                <div className="rounded-xl p-3 bg-flex-surface/40">
                  <p className="text-[10px] text-flex-muted uppercase">$/head</p>
                  <p className="text-xl font-bold">{fmtUsd(row.costPerHead)}</p>
                </div>
              </div>

              <p className="text-sm text-slate-200 border-l-2 border-flex-accent/40 pl-3">{row.signalReason}</p>
              <p className="text-xs text-flex-muted mt-2">
                Flex {row.flexAllocatedVcpu} vCPU · dhub {row.dhubCapacityUnits} units
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass rounded-xl p-4 flex gap-3 items-start">
        <GitCompareArrows className="w-6 h-6 text-flex-accent shrink-0 mt-0.5" />
        <p className="text-sm text-flex-muted">
          Cross-check with{' '}
          <Link to="/govern/alignment" className="text-flex-accent hover:underline">Alignment</Link>{' '}
          and{' '}
          <Link to="/chargeback" className="text-flex-accent hover:underline">Chargeback</Link>{' '}
          before planning cycles.
        </p>
      </div>
    </div>
  );
}
