import { consumeRows, definePlugin } from '../definePlugin';

export const alignmentPlugin = definePlugin({
  manifest: {
    id: 'flex.alignment',
    name: 'Cross-app alignment',
    version: '1.0.0',
    description: 'Flex vs EzTrac vs dhub-rpt drift and conflicts',
    route: '/govern/alignment',
    category: 'governance',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'alignment_rows',
        description: 'Metric comparison across apps',
        schema: ['id', 'domain', 'flexMetric', 'eztracMetric', 'dhubMetric', 'status'],
        direction: 'outbound',
      },
      {
        name: 'alignment_score',
        description: 'Overall alignment percentage',
        schema: ['score', 'resolvedCount', 'totalCount'],
        direction: 'outbound',
      },
      {
        name: 'resolve_conflict',
        description: 'Mark alignment row resolved',
        schema: ['id'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(alignmentPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'alignment_score') {
        const total = state.alignmentRows.length;
        const resolved = state.resolvedAlignmentIds.length;
        const score = total ? Math.round((resolved / total) * 100) : 100;
        return [{ score, resolvedCount: resolved, totalCount: total }];
      }
      return state.alignmentRows;
    }),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.alignment',
    dataset: req.dataset,
    message: 'Alignment conflict resolution accepted',
    affectedIds: req.records.map((r) => (r as { id?: string }).id).filter(Boolean) as string[],
  }),
});
