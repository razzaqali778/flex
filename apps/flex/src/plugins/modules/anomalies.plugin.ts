import { consumeRows, definePlugin } from '../definePlugin';

export const anomaliesPlugin = definePlugin({
  manifest: {
    id: 'flex.anomalies',
    name: 'Anomalies',
    version: '1.0.0',
    description: 'Cost incidents, severity, and resolution workflow',
    route: '/anomalies',
    category: 'cost',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'anomaly_events',
        description: 'All anomaly records',
        schema: ['id', 'title', 'severity', 'service', 'status', 'impact', 'deltaPercent'],
        direction: 'outbound',
      },
      {
        name: 'anomaly_feed',
        description: 'Publishable anomaly summary for partners',
        schema: ['id', 'severity', 'service', 'impact'],
        direction: 'outbound',
      },
      {
        name: 'resolve_anomaly',
        description: 'Mark anomaly resolved',
        schema: ['id'],
        direction: 'inbound',
      },
      {
        name: 'create_anomaly',
        description: 'Create a new cost incident',
        schema: ['title', 'severity', 'service', 'impact', 'deltaPercent'],
        direction: 'inbound',
      },
      {
        name: 'update_anomaly',
        description: 'Update an existing incident from partner workspace',
        schema: ['id', 'title', 'severity', 'service', 'impact', 'status', 'deltaPercent'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(anomaliesPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'anomaly_feed') {
        return state.anomalies
          .filter((a) => a.status !== 'resolved')
          .map(({ id, severity, service, impact }) => ({ id, severity, service, impact }));
      }
      return state.anomalies;
    }),
  produce: (_state, req) => ({
    ok: true,
    pluginId: 'flex.anomalies',
    dataset: req.dataset,
    message: `Anomaly action ${req.dataset} accepted`,
    affectedIds: req.records.map((r) => (r as { id?: string }).id).filter(Boolean) as string[],
  }),
});
