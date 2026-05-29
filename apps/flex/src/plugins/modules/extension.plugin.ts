import { consumeRows, definePlugin } from '../definePlugin';

export const extensionPlugin = definePlugin({
  manifest: {
    id: 'flex.extension',
    name: 'Browser extension',
    version: '1.0.0',
    description: 'Page Sense, badge snapshot, and side-panel bridge',
    route: '/',
    category: 'extension',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'extension_snapshot',
        description: 'KPI mirror used by popup and toolbar badge',
        schema: ['pendingCount', 'openAnomalies', 'totalSpend', 'spendChange', 'utilization'],
        direction: 'outbound',
      },
      {
        name: 'page_context',
        description: 'Cloud console context from Page Sense (AWS/Azure/GCP)',
        schema: ['provider', 'path', 'suggestedRoute'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(extensionPlugin.manifest, state, dataset, (ds) => {
      const pending = state.dataRequests.filter((r) => r.status === 'pending').length;
      if (ds.name === 'extension_snapshot') {
        return [
          {
            pendingCount: pending,
            openAnomalies: state.kpis.openAnomalies,
            totalSpend: state.kpis.totalSpend,
            spendChange: state.kpis.spendChange,
            utilization: state.kpis.utilization,
            lastUpdated: new Date().toISOString(),
          },
        ];
      }
      return [];
    }),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.extension',
    dataset: req.dataset,
    message:
      req.dataset === 'page_context'
        ? 'Page context received — navigate via suggestedRoute in Flex'
        : 'Extension event accepted',
  }),
});
