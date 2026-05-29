import { definePlugin } from '../../definePlugin';

export const teamsPlugin = definePlugin({
  manifest: {
    id: 'flex.ext.teams',
    name: 'Microsoft Teams',
    version: '2.0.1',
    description: 'Teams channel notifications for Flex events',
    route: '/plugins',
    category: 'extension',
    kind: 'extension',
    publisher: 'Microsoft',
    permissions: ['governance:read', 'notifications:write'],
    capabilities: { consume: true, produce: true, events: false },
    datasets: [
      {
        name: 'channel_config',
        description: 'Configured Teams webhooks (demo)',
        schema: ['channel', 'webhookUrl', 'enabled'],
        direction: 'outbound',
      },
      {
        name: 'post_message',
        description: 'Post a message to Teams',
        schema: ['channel', 'title', 'body', 'severity'],
        direction: 'inbound',
      },
    ],
  },
  consume: (_state, dataset) => {
    const ds = teamsPlugin.manifest.datasets.find((d) => d.name === (dataset ?? 'channel_config'));
    if (!ds) {
      return { ok: false, error: 'Unknown dataset', code: 'DATASET_NOT_FOUND' };
    }
    return {
      ok: true,
      pluginId: 'flex.ext.teams',
      dataset: ds.name,
      records: [
        { channel: '#finops-alerts', webhookUrl: 'https://outlook.office.com/webhook/demo', enabled: true },
        { channel: '#platform-cost', webhookUrl: 'https://outlook.office.com/webhook/demo-2', enabled: true },
      ],
      meta: {
        exportedAt: new Date().toISOString(),
        recordCount: 2,
        schema: ds.schema,
      },
    };
  },
  produce: (_state, req) => {
    if (req.dataset !== 'post_message' || !req.records.length) {
      return {
        ok: false,
        pluginId: 'flex.ext.teams',
        dataset: req.dataset,
        message: 'Provide post_message payload',
        error: 'VALIDATION',
      };
    }
    const { channel, title } = req.records[0] as { channel: string; title: string };
    return {
      ok: true,
      pluginId: 'flex.ext.teams',
      dataset: req.dataset,
      message: `Posted to Teams ${channel}: ${title}`,
    };
  },
});
