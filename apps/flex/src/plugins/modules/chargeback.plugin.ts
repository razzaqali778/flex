import { consumeRows, definePlugin } from '../definePlugin';

export const chargebackPlugin = definePlugin({
  manifest: {
    id: 'flex.chargeback',
    name: 'Chargeback & showback',
    version: '1.0.0',
    description: 'Team spend vs budget, tag compliance',
    route: '/chargeback',
    category: 'org',
    capabilities: { consume: true, produce: true, events: false },
    datasets: [
      {
        name: 'team_showback',
        description: 'Per-team chargeback rows',
        schema: ['team', 'costCenter', 'initiative', 'monthlySpend', 'budget', 'variancePct'],
        direction: 'outbound',
      },
      {
        name: 'tag_compliance',
        description: 'Tagging rules and coverage',
        schema: ['id', 'tagKey', 'coveragePct', 'untaggedSpend'],
        direction: 'outbound',
      },
      {
        name: 'update_budget',
        description: 'Patch team budget or owner',
        schema: ['id', 'budget', 'owner'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(chargebackPlugin.manifest, state, dataset, (ds) =>
      ds.name === 'tag_compliance' ? state.tagRules : state.chargeback
    ),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.chargeback',
    dataset: req.dataset,
    message: 'Chargeback update accepted',
    affectedIds: req.records.map((r) => (r as { id?: string }).id).filter(Boolean) as string[],
  }),
});
