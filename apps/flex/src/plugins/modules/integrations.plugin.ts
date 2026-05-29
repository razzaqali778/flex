import { consumeRows, definePlugin } from '../definePlugin';

export const integrationsPlugin = definePlugin({
  manifest: {
    id: 'flex.integrations',
    name: 'Partner integrations',
    version: '1.0.0',
    description: 'EzTrac and dhub-rpt connections, sync, and consumption view',
    route: '/govern/partners',
    category: 'governance',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'connected_apps',
        description: 'Partner connection status',
        schema: ['id', 'name', 'status', 'lastSync', 'direction'],
        direction: 'outbound',
      },
      {
        name: 'partner_consumption',
        description: 'What a partner consumes from Flex (query: partner=eztrac|dhub-rpt)',
        schema: ['datasetName', 'status', 'recordCount', 'lastConsumedAt'],
        direction: 'outbound',
      },
      {
        name: 'simulate_inbound_sync',
        description: 'Receive inbound sync from partner (auto-delivered)',
        schema: ['partner'],
        direction: 'inbound',
      },
      {
        name: 'pull_outbound',
        description: 'Partner pull of published datasets',
        schema: ['partner'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(integrationsPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'connected_apps') return state.connectedApps;
      return state.connectedApps;
    }),
  produce: (_state, req) => {
    const partner = (req.records[0] as { partner?: string })?.partner ?? req.sourceApp;
    return {
      ok: true,
      pluginId: 'flex.integrations',
      dataset: req.dataset,
      message: `Partner action ${req.dataset} queued for ${partner ?? 'unknown'}`,
    };
  },
});
