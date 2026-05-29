import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ExternalLink, GitCompareArrows, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { useGovernanceEmbedded } from '../hooks/useGovernanceEmbedded';
import { alignmentWorkflowActions } from '../lib/workflowGlue';
import { useFlex } from '../store/FlexContext';

const statusVariant = {
  aligned: 'success' as const,
  drift: 'warning' as const,
  conflict: 'danger' as const,
};

function fmtUsd(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : String(n);
}

export function Alignment() {
  const navigate = useNavigate();
  const embedded = useGovernanceEmbedded();
  const { derivedAlignmentRows, alignmentScore, resolveAlignmentConflict } = useFlex();
  const conflicts = derivedAlignmentRows.filter((r) => r.status === 'conflict').length;

  return (
    <div className={embedded ? undefined : 'page-shell'}>
      {!embedded && (
        <PageHeader
          title="Cross-App Alignment"
          description="Reactive score — updates when you publish datasets or resolve conflicts."
        />
      )}

      <div className="stat-grid">
        <div className="stat-card border-flex-accent">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Alignment score</p>
          <p className="font-display text-4xl font-bold mt-1">{alignmentScore}%</p>
          <p className="text-xs text-flex-success mt-1">Live from governance actions</p>
        </div>
        <div className="stat-card border-flex-danger">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Conflicts</p>
          <p className="font-display text-4xl font-bold mt-1 text-flex-danger">{conflicts}</p>
          <p className="text-xs text-flex-muted mt-1">Resolve below or in Exchange</p>
        </div>
        <div className="stat-card border-flex-accent2 flex items-center gap-3">
          <GitCompareArrows className="w-10 h-10 text-flex-accent2 shrink-0" />
          <p className="text-sm text-flex-muted">
            Publishing <strong className="text-slate-200">anomaly_feed</strong> auto-aligns FinOps forecasting row.
          </p>
        </div>
      </div>

      <div className="md:hidden space-y-3 mb-6">
        {derivedAlignmentRows.map((row) => (
          <div key={row.id} className="glass rounded-xl p-4 border border-flex-border/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="font-medium">{row.domain}</p>
              <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-flex-muted">Flex</dt>
                <dd>{typeof row.flexValue === 'number' && row.flexValue > 500 ? fmtUsd(row.flexValue) : row.flexValue}</dd>
              </div>
              <div>
                <dt className="text-flex-muted">Variance</dt>
                <dd className="font-mono">{row.variancePct}%</dd>
              </div>
              {row.eztracMetric && (
                <div>
                  <dt className="text-flex-muted">EzTrac</dt>
                  <dd>
                    {row.eztracValue != null && row.eztracValue > 500
                      ? fmtUsd(row.eztracValue)
                      : row.eztracValue}
                  </dd>
                </div>
              )}
              {row.dhubMetric && (
                <div>
                  <dt className="text-flex-muted">dhub-rpt</dt>
                  <dd>
                    {row.dhubValue != null && row.dhubValue > 500
                      ? fmtUsd(row.dhubValue)
                      : `${row.dhubValue}%`}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden md:block glass rounded-2xl overflow-x-auto shadow-card table-scroll">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-flex-border/60 text-left text-flex-muted">
              <th className="p-4">Domain</th>
              <th className="p-4">Flex</th>
              <th className="p-4">EzTrac</th>
              <th className="p-4">dhub-rpt</th>
              <th className="p-4">Variance</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {derivedAlignmentRows.map((row) => (
              <tr key={row.id} className="border-b border-flex-border/30 hover:bg-flex-surface/30">
                <td className="p-4 font-medium">{row.domain}</td>
                <td className="p-4">
                  <p className="text-xs text-flex-muted">{row.flexMetric}</p>
                  <p>{typeof row.flexValue === 'number' && row.flexValue > 500 ? fmtUsd(row.flexValue) : row.flexValue}</p>
                </td>
                <td className="p-4">
                  {row.eztracMetric ? (
                    <>
                      <p className="text-xs text-flex-muted">{row.eztracMetric}</p>
                      <p>{row.eztracValue != null && row.eztracValue > 500 ? fmtUsd(row.eztracValue) : row.eztracValue}</p>
                    </>
                  ) : (
                    <span className="text-flex-muted">—</span>
                  )}
                </td>
                <td className="p-4">
                  {row.dhubMetric ? (
                    <>
                      <p className="text-xs text-flex-muted">{row.dhubMetric}</p>
                      <p>{row.dhubValue != null && row.dhubValue > 500 ? fmtUsd(row.dhubValue) : `${row.dhubValue}%`}</p>
                    </>
                  ) : (
                    <span className="text-flex-muted">—</span>
                  )}
                </td>
                <td className="p-4 font-mono">{row.variancePct}%</td>
                <td className="p-4">
                  <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3">
        {derivedAlignmentRows
          .filter((r) => r.status !== 'aligned')
          .map((row) => {
            const actions = alignmentWorkflowActions(row);
            return (
              <div
                key={row.id}
                className={`glass rounded-xl p-4 border-l-4 text-sm ${
                  row.status === 'conflict' ? 'border-flex-danger' : 'border-flex-warning'
                }`}
              >
                <p className="font-medium">{row.domain}</p>
                <p className="text-flex-muted mt-1">{row.note}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => resolveAlignmentConflict(row.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-flex-success/10 text-flex-success border border-flex-success/30 hover:bg-flex-success/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark resolved
                  </button>
                  {actions.map((action) =>
                    action.kind === 'teams' ? (
                      <a
                        key={action.id}
                        href={action.href}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-flex-accent2/10 text-flex-accent2 border border-flex-accent2/30 hover:bg-flex-accent2/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {action.label}
                      </a>
                    ) : action.kind === 'dhub-sync' ? (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() =>
                          navigate('/govern/partners', { state: { highlightApp: 'dhub-rpt' } })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-flex-accent/10 text-flex-accent border border-flex-accent/30 hover:bg-flex-accent/20"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    ) : (
                      <Link
                        key={action.id}
                        to={action.route ?? '/govern/exchange'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-flex-accent/10 text-flex-accent border border-flex-accent/30 hover:bg-flex-accent/20"
                      >
                        {action.label} →
                      </Link>
                    )
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
