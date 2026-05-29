import { consumeRows, definePlugin } from '../definePlugin';

export const assistantPlugin = definePlugin({
  manifest: {
    id: 'flex.assistant',
    name: 'Flex AI',
    version: '1.0.0',
    description: 'RAG context export and chat action intents',
    route: '/assistant',
    category: 'tools',
    capabilities: { consume: true, produce: true, events: false },
    datasets: [
      {
        name: 'knowledge_context',
        description: 'Compact state snapshot for external LLM / copilot',
        schema: ['kpis', 'pendingApprovals', 'openAnomalies', 'savingsCount', 'alignmentConflicts'],
        direction: 'outbound',
      },
      {
        name: 'chat_intent',
        description: 'Submit a natural-language intent for routing',
        schema: ['query', 'preferredRoute'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(assistantPlugin.manifest, state, dataset, () => {
      const pending = state.dataRequests.filter((r) => r.status === 'pending').length;
      const conflicts = state.alignmentRows.filter(
        (r) => r.status === 'conflict' && !state.resolvedAlignmentIds.includes(r.id)
      ).length;
      return [
        {
          kpis: state.kpis,
          pendingApprovals: pending,
          openAnomalies: state.anomalies.filter((a) => a.status !== 'resolved').length,
          savingsCount: state.savings.length,
          alignmentConflicts: conflicts,
        },
      ];
    }),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.assistant',
    dataset: req.dataset,
    message: req.dataset === 'chat_intent' ? 'Intent routed to Flex AI (open /assistant)' : 'Accepted',
  }),
});
