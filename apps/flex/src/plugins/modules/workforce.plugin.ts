import { consumeRows, definePlugin } from '../definePlugin';

export const workforcePlugin = definePlugin({
  manifest: {
    id: 'flex.workforce',
    name: 'Workforce × infrastructure',
    version: '1.0.0',
    description: 'Squad capacity vs cloud cost and hiring signals',
    route: '/workforce',
    category: 'org',
    capabilities: { consume: true, produce: true, events: false },
    datasets: [
      {
        name: 'squad_matrix',
        description: 'Squad headcount, capacity, cloud cost, signals',
        schema: ['squad', 'headcount', 'capacityUsedPct', 'monthlyCloudCost', 'signal'],
        direction: 'outbound',
      },
      {
        name: 'acknowledge_signal',
        description: 'Acknowledge a workforce planning signal',
        schema: ['id'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(workforcePlugin.manifest, state, dataset, () => state.workforce),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.workforce',
    dataset: req.dataset,
    message: 'Workforce signal acknowledged',
    affectedIds: req.records.map((r) => (r as { id?: string }).id).filter(Boolean) as string[],
  }),
});
