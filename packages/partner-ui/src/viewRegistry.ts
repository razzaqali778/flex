import type { PluginImport } from './pluginImport';

export type ViewKind =
  | 'kpi'
  | 'chargeback'
  | 'anomalies'
  | 'usage'
  | 'savings'
  | 'alignment'
  | 'workforce'
  | 'resources'
  | 'consumption'
  | 'manifest'
  | 'requests'
  | 'knowledge'
  | 'generic';

const DATASET_VIEW: Record<string, ViewKind> = {
  kpi_snapshot: 'kpi',
  team_showback: 'chargeback',
  chargeback_rows: 'chargeback',
  anomaly_events: 'anomalies',
  anomaly_feed: 'anomalies',
  open_incidents: 'anomalies',
  ticket_candidates: 'anomalies',
  usage_history: 'usage',
  usage_trend: 'usage',
  savings_opportunities: 'savings',
  alignment_rows: 'alignment',
  alignment_score: 'alignment',
  squad_matrix: 'workforce',
  allocation_matrix: 'resources',
  consumption_status: 'consumption',
  partner_consumption: 'consumption',
  export_manifest: 'manifest',
  data_requests: 'requests',
  published_datasets: 'consumption',
  knowledge_context: 'knowledge',
  extension_snapshot: 'kpi',
};

export function resolveViewKind(imp: PluginImport): ViewKind {
  const byDataset = DATASET_VIEW[imp.dataset];
  if (byDataset) return byDataset;

  const first = imp.records[0];
  if (!first) return 'generic';

  if ('monthlySpend' in first && 'team' in first) return 'chargeback';
  if ('severity' in first && 'title' in first) return 'anomalies';
  if ('allocated' in first && 'used' in first) return 'resources';
  if ('monthlySavings' in first) return 'savings';
  if ('datasetName' in first) return 'consumption';
  if ('table' in first && 'rowCount' in first) return 'manifest';
  if ('totalSpend' in first || 'openAnomalies' in first) return 'kpi';

  return 'generic';
}

export const VIEW_LABELS: Record<ViewKind, string> = {
  kpi: 'Executive KPIs',
  chargeback: 'Team chargeback',
  anomalies: 'Cost anomalies',
  usage: 'Cloud usage trend',
  savings: 'Optimization opportunities',
  alignment: 'Cross-app alignment',
  workforce: 'Workforce squads',
  resources: 'Resource allocation',
  consumption: 'Flex datasets for this app',
  manifest: 'Warehouse export',
  requests: 'Governance requests',
  knowledge: 'AI context bundle',
  generic: 'Data table',
};

/** Datasets most useful per partner app (for empty-state hints). */
export const RECOMMENDED_READS: Record<'eztrac' | 'rpt', { pluginId: string; dataset: string; label: string }[]> = {
  eztrac: [
    { pluginId: 'flex.chargeback', dataset: 'team_showback', label: 'Team spend vs budget' },
    { pluginId: 'flex.dashboard', dataset: 'kpi_snapshot', label: 'FinOps KPIs' },
    { pluginId: 'flex.anomalies', dataset: 'anomaly_events', label: 'Open anomalies' },
    { pluginId: 'flex.integrations', dataset: 'partner_consumption', label: 'Published datasets' },
    { pluginId: 'flex.optimization', dataset: 'savings_opportunities', label: 'Savings pipeline' },
  ],
  rpt: [
    { pluginId: 'flex.resources', dataset: 'allocation_matrix', label: 'Allocation vs usage' },
    { pluginId: 'flex.workforce', dataset: 'squad_matrix', label: 'Squad capacity matrix' },
    { pluginId: 'flex.alignment', dataset: 'alignment_rows', label: 'Alignment conflicts' },
    { pluginId: 'flex.integrations', dataset: 'partner_consumption', label: 'Published datasets' },
    { pluginId: 'flex.cloud-usage', dataset: 'usage_history', label: 'Usage history' },
  ],
};
