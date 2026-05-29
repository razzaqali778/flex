import { consumeRows, definePlugin } from '../definePlugin';

export const optimizationPlugin = definePlugin({
  manifest: {
    id: 'flex.optimization',
    name: 'Savings & optimization',
    version: '1.0.0',
    description: 'Savings lifecycle opportunities (identified → realized)',
    route: '/optimization',
    category: 'cost',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'savings_opportunities',
        description: 'All savings opportunities with stage and owner',
        schema: ['id', 'title', 'stage', 'monthlySavings', 'owner', 'realizedSavings'],
        direction: 'outbound',
      },
      {
        name: 'advance_stage',
        description: 'Advance one opportunity to the next lifecycle stage',
        schema: ['id'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(optimizationPlugin.manifest, state, dataset, () => state.savings),
  produce: (_state, req) => {
    const id = (req.records[0] as { id?: string })?.id;
    if (req.dataset !== 'advance_stage' || !id) {
      return {
        ok: false,
        pluginId: 'flex.optimization',
        dataset: req.dataset,
        message: 'advance_stage requires { id }',
        error: 'VALIDATION',
      };
    }
    return {
      ok: true,
      pluginId: 'flex.optimization',
      dataset: req.dataset,
      message: `Stage advance queued for ${id}`,
      affectedIds: [id],
    };
  },
});
