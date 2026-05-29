import { cloudUsageHistory } from '../../data/mockData';
import { consumeRows, definePlugin } from '../definePlugin';

export const dashboardPlugin = definePlugin({
  manifest: {
    id: 'flex.dashboard',
    name: 'Dashboard',
    version: '1.0.0',
    description: 'Executive KPIs, spend pulse, and quick-action state',
    route: '/',
    category: 'overview',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'kpi_snapshot',
        description: 'Current FinOps KPI bundle',
        schema: ['totalSpend', 'spendChange', 'utilization', 'activeResources', 'openAnomalies', 'pendingApprovals'],
        direction: 'outbound',
      },
      {
        name: 'usage_trend',
        description: 'Monthly cloud usage by category',
        schema: ['date', 'compute', 'storage', 'network', 'database'],
        direction: 'outbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(dashboardPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'usage_trend') return cloudUsageHistory;
      return [{ ...state.kpis, pendingApprovals: state.dataRequests.filter((r) => r.status === 'pending').length }];
    }),
  produce: (_state, req) => {
    if (req.dataset !== 'kpi_snapshot' || !req.records.length) {
      return { ok: false, pluginId: 'flex.dashboard', dataset: req.dataset, message: 'Provide kpi_snapshot records', error: 'VALIDATION' };
    }
    return {
      ok: true,
      pluginId: 'flex.dashboard',
      dataset: req.dataset,
      message: 'KPI snapshot accepted (demo: read-only merge in production API)',
    };
  },
});
