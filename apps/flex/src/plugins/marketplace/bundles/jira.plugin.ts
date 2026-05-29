import { consumeRows, definePlugin } from '../../definePlugin';

export const jiraPlugin = definePlugin({
  manifest: {
    id: 'flex.ext.jira',
    name: 'Jira Cost Tickets',
    version: '1.1.0',
    description: 'Create Jira issues from cost anomalies',
    route: '/plugins',
    category: 'extension',
    kind: 'extension',
    publisher: 'Atlassian',
    permissions: ['anomalies:read', 'issues:write'],
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'ticket_candidates',
        description: 'Open anomalies without linked Jira key',
        schema: ['id', 'title', 'severity', 'service', 'impact'],
        direction: 'outbound',
      },
      {
        name: 'create_ticket',
        description: 'Create Jira issue from anomaly',
        schema: ['anomalyId', 'projectKey', 'assignee'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(jiraPlugin.manifest, state, dataset, () =>
      state.anomalies
        .filter((a) => a.status !== 'resolved')
        .map(({ id, title, severity, service, impact }) => ({ id, title, severity, service, impact }))
    ),
  produce: (state, req) => {
    if (req.dataset !== 'create_ticket' || !req.records.length) {
      return {
        ok: false,
        pluginId: 'flex.ext.jira',
        dataset: req.dataset,
        message: 'Provide create_ticket with anomalyId and projectKey',
        error: 'VALIDATION',
      };
    }
    const { anomalyId, projectKey } = req.records[0] as { anomalyId: string; projectKey: string };
    const anomaly = state.anomalies.find((a) => a.id === anomalyId);
    if (!anomaly) {
      return {
        ok: false,
        pluginId: 'flex.ext.jira',
        dataset: req.dataset,
        message: `Anomaly ${anomalyId} not found`,
        error: 'VALIDATION',
      };
    }
    const key = `${projectKey}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      ok: true,
      pluginId: 'flex.ext.jira',
      dataset: req.dataset,
      message: `Created Jira ${key}: ${anomaly.title}`,
      affectedIds: [anomalyId],
    };
  },
});
