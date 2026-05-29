import { getPartnerConsumption } from '../../lib/partnerConsumption';
import { consumeRows, definePlugin, err } from '../definePlugin';

const PARTNER_ID = 'dhub-rpt';

export const partnerDhubRptPlugin = definePlugin({
  manifest: {
    id: 'flex.partner.dhub-rpt',
    name: 'dhub-rpt partner connector',
    version: '1.0.0',
    description: 'dhub-rpt consume/produce contract for Flex data exchange',
    route: '/apps/dhub-rpt',
    category: 'tools',
    capabilities: { consume: true, produce: true, events: true },
    datasets: [
      {
        name: 'consumption_status',
        description: 'Datasets dhub-rpt currently consumes from Flex',
        schema: ['datasetName', 'purpose', 'recordCount', 'status', 'lastConsumedAt', 'schema'],
        direction: 'outbound',
      },
      {
        name: 'request_sync',
        description: 'Ask Flex to create a sync request from dhub-rpt',
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
        description: 'Pull active published datasets targeted to dhub-rpt',
        schema: ['partner'],
        direction: 'inbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(partnerDhubRptPlugin.manifest, state, dataset, (ds) => {
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
      pluginId: 'flex.partner.dhub-rpt',
      dataset: req.dataset,
      message: `Accepted ${req.dataset} from dhub-rpt`,
    };
  },
});
