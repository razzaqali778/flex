import { consumeRows, definePlugin } from '../../definePlugin';

export const pagerdutyPlugin = definePlugin({
  manifest: {
    id: 'flex.ext.pagerduty',
    name: 'PagerDuty Alerts',
    version: '1.2.0',
    description: 'Escalate cost anomalies to on-call',
    route: '/plugins',
    category: 'extension',
    kind: 'extension',
    publisher: 'PagerDuty Inc.',
    permissions: ['anomalies:read', 'incidents:write'],
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'open_incidents',
        description: 'Open anomalies eligible for paging',
        schema: ['id', 'title', 'severity', 'impact', 'service'],
        direction: 'outbound',
      },
      {
        name: 'trigger_page',
        description: 'Create PagerDuty incident for anomaly',
        schema: ['anomalyId', 'routingKey', 'urgency'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(pagerdutyPlugin.manifest, state, dataset, () =>
      state.anomalies
        .filter((a) => a.status !== 'resolved' && (a.severity === 'critical' || a.severity === 'high'))
        .map(({ id, title, severity, impact, service }) => ({ id, title, severity, impact, service }))
    ),
  produce: (_state, req) => {
    if (req.dataset !== 'trigger_page' || !req.records.length) {
      return {
        ok: false,
        pluginId: 'flex.ext.pagerduty',
        dataset: req.dataset,
        message: 'Provide trigger_page with anomalyId',
        error: 'VALIDATION',
      };
    }
    const { anomalyId, urgency } = req.records[0] as { anomalyId: string; urgency?: string };
    return {
      ok: true,
      pluginId: 'flex.ext.pagerduty',
      dataset: req.dataset,
      message: `PagerDuty incident queued for ${anomalyId} (${urgency ?? 'high'})`,
      affectedIds: [anomalyId],
    };
  },
});
