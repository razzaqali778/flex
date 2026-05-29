import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { ScrollableTable } from '../components/ScrollableTable';
import { useFlex } from '../store/FlexContext';

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function Resources() {
  const { resourceAllocations } = useFlex();

  return (
    <div className="page-shell">
      <PageHeader
        title="Resource Allocation"
        description="Track allocated vs used capacity — shared with dhub-rpt for planning cycles."
      />

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {resourceAllocations.map((r) => {
          const pct = Math.round((r.used / r.allocated) * 100);
          const Icon = trendIcon[r.trend];
          return (
            <div
              key={r.id}
              className="glass rounded-xl p-4 shadow-card border border-flex-border/40"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm break-words">{r.name}</p>
                  <p className="text-xs text-flex-muted">{r.team}</p>
                </div>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    r.trend === 'up'
                      ? 'text-flex-warning'
                      : r.trend === 'down'
                        ? 'text-flex-success'
                        : 'text-flex-muted'
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-flex-muted mb-2">
                <span>
                  {r.used} / {r.allocated} {r.unit}
                </span>
                <span className="font-medium text-slate-200">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-flex-surface overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct > 90 ? 'bg-flex-danger' : pct > 75 ? 'bg-flex-warning' : 'bg-flex-success'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet+ : table */}
      <ScrollableTable className="hidden md:block">
        <div className="glass rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-flex-border/60 text-left text-flex-muted">
                <th className="p-3 lg:p-4 font-medium">Resource</th>
                <th className="p-3 lg:p-4 font-medium">Team</th>
                <th className="p-3 lg:p-4 font-medium">Allocated</th>
                <th className="p-3 lg:p-4 font-medium">Used</th>
                <th className="p-3 lg:p-4 font-medium">Utilization</th>
                <th className="p-3 lg:p-4 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {resourceAllocations.map((r) => {
                const pct = Math.round((r.used / r.allocated) * 100);
                const Icon = trendIcon[r.trend];
                return (
                  <tr
                    key={r.id}
                    className="border-b border-flex-border/30 hover:bg-flex-surface/40 transition-colors"
                  >
                    <td className="p-3 lg:p-4 font-medium">{r.name}</td>
                    <td className="p-3 lg:p-4 text-flex-muted">{r.team}</td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">
                      {r.allocated} {r.unit}
                    </td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">
                      {r.used} {r.unit}
                    </td>
                    <td className="p-3 lg:p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px] h-2 rounded-full bg-flex-surface overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 90
                                ? 'bg-flex-danger'
                                : pct > 75
                                  ? 'bg-flex-warning'
                                  : 'bg-flex-success'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4">
                      <Icon
                        className={`w-4 h-4 ${
                          r.trend === 'up'
                            ? 'text-flex-warning'
                            : r.trend === 'down'
                              ? 'text-flex-success'
                              : 'text-flex-muted'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ScrollableTable>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-4 border-l-4 border-flex-success">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Healthy</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">3</p>
          <p className="text-sm text-flex-muted">Under 80% utilization</p>
        </div>
        <div className="glass rounded-xl p-4 border-l-4 border-flex-warning">
          <p className="text-xs text-flex-muted uppercase tracking-wider">At risk</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">2</p>
          <p className="text-sm text-flex-muted">80–95% utilization</p>
        </div>
        <div className="glass rounded-xl p-4 border-l-4 border-flex-danger">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Overallocated</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">1</p>
          <p className="text-sm text-flex-muted">Above 95%</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-flex-muted">
        Published dataset: <Badge variant="info">allocation_matrix</Badge> → dhub-rpt
      </p>
    </div>
  );
}
