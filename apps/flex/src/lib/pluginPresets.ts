/** Plain-language actions — maps to plugin consume/produce under the hood */

export type PluginPresetKind = 'get' | 'send';

export interface PluginPreset {
  id: string;
  kind: PluginPresetKind;
  label: string;
  description: string;
  pluginId: string;
  dataset: string;
  params?: Record<string, unknown>;
  /** For send actions with a simple form */
  sendForm?: 'partner-sync' | 'partner-pull' | 'inbound-request' | 'role';
  routeAfterSend?: string;
  routeLabel?: string;
}

export const PLUGIN_PRESETS: PluginPreset[] = [
  {
    id: 'get-kpis',
    kind: 'get',
    label: 'Get dashboard KPIs',
    description: 'Spend, utilization, anomalies — for reports or EzTrac',
    pluginId: 'flex.dashboard',
    dataset: 'kpi_snapshot',
  },
  {
    id: 'get-pending',
    kind: 'get',
    label: 'Get pending approvals',
    description: 'Inbound requests waiting in Governance',
    pluginId: 'flex.governance',
    dataset: 'data_requests',
  },
  {
    id: 'get-published',
    kind: 'get',
    label: 'Get published datasets',
    description: 'What Flex has sent to partners',
    pluginId: 'flex.governance',
    dataset: 'published_datasets',
  },
  {
    id: 'get-chargeback',
    kind: 'get',
    label: 'Get team chargeback',
    description: 'Showback by team for finance tools',
    pluginId: 'flex.chargeback',
    dataset: 'team_showback',
  },
  {
    id: 'get-anomalies',
    kind: 'get',
    label: 'Get open anomalies',
    description: 'Cost incidents for alerting or feeds',
    pluginId: 'flex.anomalies',
    dataset: 'anomaly_events',
  },
  {
    id: 'get-eztrac-consumption',
    kind: 'get',
    label: 'See what EzTrac is using',
    description: 'Datasets EzTrac consumes from Flex',
    pluginId: 'flex.partner.eztrac',
    dataset: 'consumption_status',
  },
  {
    id: 'get-dhub-consumption',
    kind: 'get',
    label: 'See what dhub-rpt is using',
    description: 'Datasets dhub-rpt consumes from Flex',
    pluginId: 'flex.partner.dhub-rpt',
    dataset: 'consumption_status',
  },
  {
    id: 'send-eztrac-sync',
    kind: 'send',
    label: 'EzTrac sends a data request',
    description: 'Same as Partner apps → Simulate sync — then approve in Governance',
    pluginId: 'flex.partner.eztrac',
    dataset: 'request_sync',
    sendForm: 'partner-sync',
    routeAfterSend: '/govern/exchange',
    routeLabel: 'Go to Approvals',
  },
  {
    id: 'send-dhub-sync',
    kind: 'send',
    label: 'dhub-rpt sends a data request',
    description: 'Creates a pending inbound request for Platform to approve',
    pluginId: 'flex.partner.dhub-rpt',
    dataset: 'request_sync',
    sendForm: 'partner-sync',
    routeAfterSend: '/govern/exchange',
    routeLabel: 'Go to Approvals',
  },
  {
    id: 'send-eztrac-pull',
    kind: 'send',
    label: 'EzTrac pulls published data',
    description: 'Simulate EzTrac downloading Flex datasets',
    pluginId: 'flex.partner.eztrac',
    dataset: 'pull_published',
    sendForm: 'partner-pull',
  },
  {
    id: 'send-dhub-pull',
    kind: 'send',
    label: 'dhub-rpt pulls published data',
    description: 'Simulate dhub-rpt downloading Flex datasets',
    pluginId: 'flex.partner.dhub-rpt',
    dataset: 'pull_published',
    sendForm: 'partner-pull',
  },
];

export function defaultPartnerForPreset(presetId: string): 'eztrac' | 'dhub-rpt' {
  if (presetId.includes('dhub')) return 'dhub-rpt';
  return 'eztrac';
}
