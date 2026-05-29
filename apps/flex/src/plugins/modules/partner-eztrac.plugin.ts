import { getPartnerConsumption } from '../../lib/partnerConsumption';
import { consumeRows, definePlugin, err } from '../definePlugin';

const PARTNER_ID = 'eztrac';

export const partnerEzTracPlugin = definePlugin({
  manifest: {
    id: 'flex.partner.eztrac',
    name: 'EzTrac partner connector',
    version: '1.0.0',
    description: 'EzTrac consume/produce contract for Flex data exchange',
    route: '/apps/eztrac',
    category: 'tools',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'consumption_status',
        description: 'Datasets EzTrac currently consumes from Flex',
        schema: ['datasetName', 'purpose', 'recordCount', 'status', 'lastConsumedAt', 'schema'],
        direction: 'outbound',
      },
      {
        name: 'request_sync',
        description: 'Ask Flex to create a sync request from EzTrac',
        schema: ['partner'],
        direction: 'inbound',
      },
      {
        name: 'inbound_request',
        description: 'Submit governed inbound request to Flex approvals',
        schema: ['fromApp', 'dataset', 'recordCount', 'purpose'],
        direction: 'inbound',
      },
      {
        name: 'pull_published',
        description: 'Pull active published datasets targeted to EzTrac',
        schema: ['partner'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(partnerEzTracPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'consumption_status') {
        return getPartnerConsumption(state, PARTNER_ID);
      }
      return [];
    }),
  produce: (_state, req) => {
    if (!['request_sync', 'inbound_request', 'pull_published'].includes(req.dataset)) {
      return err('DATASET_NOT_FOUND', `Unknown dataset: ${req.dataset}`);
    }
    return {
      ok: true,
      pluginId: 'flex.partner.eztrac',
      dataset: req.dataset,
      message: `Accepted ${req.dataset} from EzTrac`,
    };
  },
});
