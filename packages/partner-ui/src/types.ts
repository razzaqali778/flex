export type PartnerTheme = 'market' | 'emerald' | 'violet';

export type PartnerTab = 'workspace' | 'installed' | 'all';

export type DatasetDirection = 'inbound' | 'outbound' | 'bidirectional';

export interface PluginDataset {
  name: string;
  description: string;
  direction: DatasetDirection;
}

export interface PluginListing {
  pluginId: string;
  name: string;
  version: string;
  description: string;
  icon?: string;
  category?: string;
  permissions?: string[];
  datasets?: PluginDataset[];
}

export function datasetsFor(plugin: PluginListing): PluginDataset[] {
  return Array.isArray(plugin.datasets) ? plugin.datasets : [];
}

export function directionLabel(direction: DatasetDirection): string {
  if (direction === 'inbound') return 'Sends to Flex';
  if (direction === 'bidirectional') return 'Read + send';
  return 'Reads Flex';
}

/** Filter plugins by whether they can send data to Flex or read from Flex. */
export type DataFlowFilter = 'all' | 'send' | 'read' | 'both';

export function readDatasets(plugin: PluginListing): PluginDataset[] {
  return datasetsFor(plugin).filter((d) => d.direction === 'outbound' || d.direction === 'bidirectional');
}

export function sendDatasets(plugin: PluginListing): PluginDataset[] {
  return datasetsFor(plugin).filter((d) => d.direction === 'inbound' || d.direction === 'bidirectional');
}

export function canSendToFlex(plugin: PluginListing): boolean {
  if (sendDatasets(plugin).length > 0) return true;
  const id = plugin.pluginId;
  const names = datasetsFor(plugin).map((d) => d.name);
  if (id === 'flex.resources' && names.includes('allocation_matrix')) return true;
  if (id === 'flex.workforce' && names.includes('squad_matrix')) return true;
  return false;
}

export function canReadFromFlex(plugin: PluginListing): boolean {
  return readDatasets(plugin).length > 0;
}

export function matchesDataFlowFilter(plugin: PluginListing, filter: DataFlowFilter): boolean {
  const send = canSendToFlex(plugin);
  const read = canReadFromFlex(plugin);
  if (filter === 'send') return send;
  if (filter === 'read') return read;
  if (filter === 'both') return send && read;
  return true;
}

export const DATA_FLOW_FILTER_LABELS: Record<DataFlowFilter, string> = {
  all: 'All',
  send: 'Sends to Flex',
  read: 'Reads from Flex',
  both: 'Read & send',
};

const SEND_DATASET_PRIORITY = [
  'inbound_request',
  'allocation_matrix',
  'squad_matrix',
  'request_sync',
  'simulate_inbound_sync',
  'update_anomaly',
  'create_anomaly',
  'resolve_anomaly',
  'update_budget',
];

const READ_DATASET_PRIORITY = ['consumption_status', 'team_showback', 'anomaly_events', 'kpi_snapshot'];

export function primarySendDataset(plugin: PluginListing): PluginDataset | null {
  if (plugin.pluginId === 'flex.resources') {
    const matrix = datasetsFor(plugin).find((d) => d.name === 'allocation_matrix');
    if (matrix) return matrix;
  }
  if (plugin.pluginId === 'flex.workforce') {
    const matrix = datasetsFor(plugin).find((d) => d.name === 'squad_matrix');
    if (matrix) return matrix;
  }
  const list = sendDatasets(plugin);
  if (!list.length) return null;
  for (const name of SEND_DATASET_PRIORITY) {
    const found = list.find((d) => d.name === name);
    if (found) return found;
  }
  return list[0];
}

export function primaryReadDataset(plugin: PluginListing): PluginDataset | null {
  const list = readDatasets(plugin);
  if (!list.length) return null;
  for (const name of READ_DATASET_PRIORITY) {
    const found = list.find((d) => d.name === name);
    if (found) return found;
  }
  return list[0];
}
