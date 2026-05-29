import { cloudUsageHistory } from '../../../data/mockData';
import { consumeRows, definePlugin } from '../../definePlugin';

export const snowflakePlugin = definePlugin({
  manifest: {
    id: 'flex.ext.snowflake',
    name: 'Snowflake Export',
    version: '1.0.3',
    description: 'Warehouse export manifests for FinOps data',
    route: '/plugins',
    category: 'extension',
    kind: 'extension',
    publisher: 'Snowflake',
    permissions: ['chargeback:read', 'cloud-usage:read'],
    capabilities: { consume: true, produce: false, events: false },
    datasets: [
      {
        name: 'export_manifest',
        description: 'Tables and row counts for scheduled Snowflake load',
        schema: ['table', 'rowCount', 'lastExportedAt'],
        direction: 'outbound',
      },
      {
        name: 'chargeback_rows',
        description: 'Team showback for FINOPS.CHARGEBACK',
        schema: ['team', 'monthlySpend', 'budget', 'owner'],
        direction: 'outbound',
      },
      {
        name: 'usage_trend',
        description: 'Monthly usage for FINOPS.USAGE_TREND',
        schema: ['date', 'compute', 'storage', 'network', 'database'],
        direction: 'outbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(snowflakePlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'chargeback_rows') {
        return state.chargeback.map(({ team, monthlySpend, budget, owner }) => ({
          team,
          monthlySpend,
          budget,
          owner,
        }));
      }
      if (ds.name === 'usage_trend') return cloudUsageHistory;
      return [
        {
          table: 'FINOPS.CHARGEBACK',
          rowCount: state.chargeback.length,
          lastExportedAt: new Date().toISOString(),
        },
        {
          table: 'FINOPS.USAGE_TREND',
          rowCount: cloudUsageHistory.length,
          lastExportedAt: new Date().toISOString(),
        },
      ];
    }),
});
