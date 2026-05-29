import { consumeRows, definePlugin } from '../definePlugin';
import type { PluginProduceRequest } from '../types';

export const governancePlugin = definePlugin({
  manifest: {
    id: 'flex.governance',
    name: 'Governance hub',
    version: '1.0.0',
    description: 'Inbound approvals, outbound datasets, and transfer audit trail',
    route: '/govern/exchange',
    category: 'governance',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'data_requests',
        description: 'Inbound partner data requests (pending + history)',
        schema: ['id', 'fromApp', 'dataset', 'status', 'recordCount', 'purpose', 'requestedAt'],
        direction: 'inbound',
      },
      {
        name: 'published_datasets',
        description: 'Outbound datasets Flex publishes to partners',
        schema: ['id', 'name', 'status', 'schema', 'consumers', 'recordCount', 'lastPublished'],
        direction: 'outbound',
      },
      {
        name: 'transfer_log',
        description: 'Governed transfer audit events',
        schema: ['id', 'at', 'direction', 'from', 'to', 'dataset', 'status', 'message'],
        direction: 'bidirectional',
      },
      {
        name: 'inbound_request',
        description: 'Submit a new inbound data request (partner → Flex)',
        schema: ['fromApp', 'dataset', 'recordCount', 'purpose'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(governancePlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'data_requests') return state.dataRequests;
      if (ds.name === 'published_datasets') return state.publishedDatasets;
      if (ds.name === 'transfer_log') return state.transferLog;
      return [];
    }),
  produce: (_state, req: PluginProduceRequest) => {
    if (req.dataset !== 'inbound_request') {
      return {
        ok: false,
        pluginId: 'flex.governance',
        dataset: req.dataset,
        message: 'Use inbound_request dataset to send data',
        error: 'VALIDATION',
      };
    }
    const row = req.records[0] as {
      fromApp?: string;
      dataset?: string;
      recordCount?: number;
      purpose?: string;
    };
    if (!row?.fromApp || !row?.dataset) {
      return {
        ok: false,
        pluginId: 'flex.governance',
        dataset: req.dataset,
        message: 'inbound_request requires fromApp and dataset',
        error: 'VALIDATION',
      };
    }
    return {
      ok: true,
      pluginId: 'flex.governance',
      dataset: req.dataset,
      message: `Queued inbound request from ${row.fromApp} — approve in Governance hub`,
      affectedIds: [],
    };
  },
});
