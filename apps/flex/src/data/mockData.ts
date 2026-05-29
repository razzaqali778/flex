import type {
  Anomaly,
  CloudUsagePoint,
  ConnectedApp,
  DataRequest,
  ForecastSlice,
  KpiSnapshot,
  PublishedDataset,
  ResourceAllocation,
} from '../types';

export const initialKpis: KpiSnapshot = {
  totalSpend: 284750,
  spendChange: -4.2,
  utilization: 78.4,
  activeResources: 1247,
  openAnomalies: 5,
  pendingApprovals: 3,
};

export const cloudUsageHistory: CloudUsagePoint[] = [
  { date: 'Jan', compute: 42, storage: 18, network: 12, database: 28 },
  { date: 'Feb', compute: 45, storage: 19, network: 11, database: 30 },
  { date: 'Mar', compute: 48, storage: 20, network: 13, database: 29 },
  { date: 'Apr', compute: 52, storage: 22, network: 14, database: 32 },
  { date: 'May', compute: 49, storage: 21, network: 12, database: 31 },
  { date: 'Jun', compute: 55, storage: 24, network: 15, database: 34 },
];

export const resourceAllocations: ResourceAllocation[] = [
  { id: 'r1', name: 'EKS Production', team: 'Platform', allocated: 120, used: 98, unit: 'vCPU', trend: 'up' },
  { id: 'r2', name: 'RDS Analytics', team: 'Data', allocated: 64, used: 61, unit: 'vCPU', trend: 'stable' },
  { id: 'r3', name: 'S3 Data Lake', team: 'Data', allocated: 50, used: 42, unit: 'TB', trend: 'up' },
  { id: 'r4', name: 'Lambda APIs', team: 'Product', allocated: 2000, used: 1450, unit: 'GB-sec', trend: 'down' },
  { id: 'r5', name: 'Redshift DW', team: 'Finance', allocated: 32, used: 28, unit: 'nodes', trend: 'stable' },
  { id: 'r6', name: 'CDN Edge', team: 'Platform', allocated: 8, used: 6.2, unit: 'TB/mo', trend: 'up' },
];

export const anomalies: Anomaly[] = [
  { id: 'a1', title: 'Compute spike — us-east-1', severity: 'critical', service: 'EC2', detectedAt: '2026-05-22T08:14:00Z', impact: '+$12.4K projected', status: 'open', deltaPercent: 34 },
  { id: 'a2', title: 'Unattached EBS volumes', severity: 'high', service: 'EBS', detectedAt: '2026-05-21T16:30:00Z', impact: '$2.1K/mo waste', status: 'investigating', deltaPercent: 0 },
  { id: 'a3', title: 'S3 egress anomaly', severity: 'medium', service: 'S3', detectedAt: '2026-05-20T11:00:00Z', impact: 'Unusual transfer pattern', status: 'open', deltaPercent: 18 },
  { id: 'a4', title: 'Idle RDS instances', severity: 'medium', service: 'RDS', detectedAt: '2026-05-19T09:45:00Z', impact: '$890/mo', status: 'resolved', deltaPercent: -12 },
  { id: 'a5', title: 'Reserved instance mismatch', severity: 'low', service: 'Cost Explorer', detectedAt: '2026-05-18T14:20:00Z', impact: 'Coverage gap 8%', status: 'open', deltaPercent: 8 },
];

export const connectedApps: ConnectedApp[] = [
  {
    id: 'eztrac',
    name: 'EzTrac',
    description: 'Finance forecasting — desktop app for budget & spend projections',
    status: 'connected',
    lastSync: '2026-05-22T07:55:00Z',
    direction: 'bidirectional',
  },
  {
    id: 'dhub-rpt',
    name: 'dhub-rpt',
    description: 'Resource planning — capacity & allocation workflows',
    status: 'connected',
    lastSync: '2026-05-22T07:42:00Z',
    direction: 'bidirectional',
  },
];

export const initialDataRequests: DataRequest[] = [
  { id: 'dr1', fromApp: 'eztrac', dataset: 'monthly_spend_by_service', requestedAt: '2026-05-22T06:00:00Z', status: 'pending', recordCount: 1240, purpose: 'Q3 forecast model refresh' },
  { id: 'dr2', fromApp: 'dhub-rpt', dataset: 'resource_utilization_snapshots', requestedAt: '2026-05-21T14:30:00Z', status: 'pending', recordCount: 890, purpose: 'Capacity planning cycle' },
  { id: 'dr3', fromApp: 'eztrac', dataset: 'anomaly_summary_export', requestedAt: '2026-05-20T10:00:00Z', status: 'approved', recordCount: 45, purpose: 'Risk-adjusted forecast' },
];

export const initialPublishedDatasets: PublishedDataset[] = [
  { id: 'pd1', name: 'cloud_cost_daily', description: 'Daily aggregated cloud spend by service & region', schema: ['date', 'service', 'region', 'amount_usd'], consumers: ['eztrac', 'dhub-rpt'], lastPublished: '2026-05-22T00:00:00Z', status: 'active', recordCount: 36500 },
  { id: 'pd2', name: 'allocation_matrix', description: 'Team-level resource allocation vs actual usage', schema: ['team', 'resource', 'allocated', 'used', 'unit'], consumers: ['dhub-rpt'], lastPublished: '2026-05-21T18:00:00Z', status: 'active', recordCount: 420 },
  { id: 'pd3', name: 'finops_kpi_bundle', description: 'Executive KPIs for dashboards', schema: ['kpi', 'value', 'period'], consumers: ['eztrac'], lastPublished: '2026-05-20T12:00:00Z', status: 'active', recordCount: 24 },
  { id: 'pd4', name: 'anomaly_feed', description: 'Real-time anomaly events (draft)', schema: ['id', 'severity', 'service', 'impact'], consumers: [], lastPublished: '', status: 'draft', recordCount: 0 },
];

export const forecastData: ForecastSlice[] = [
  { month: 'Jan', actual: 245000, forecast: 248000, budget: 250000 },
  { month: 'Feb', actual: 252000, forecast: 255000, budget: 250000 },
  { month: 'Mar', actual: 261000, forecast: 258000, budget: 255000 },
  { month: 'Apr', actual: 268000, forecast: 265000, budget: 260000 },
  { month: 'May', actual: 272000, forecast: 278000, budget: 265000 },
  { month: 'Jun', forecast: 285000, budget: 270000 },
  { month: 'Jul', forecast: 292000, budget: 275000 },
  { month: 'Aug', forecast: 298000, budget: 280000 },
];

export const serviceBreakdown = [
  { name: 'Compute', value: 42, color: '#22d3ee' },
  { name: 'Database', value: 28, color: '#818cf8' },
  { name: 'Storage', value: 18, color: '#34d399' },
  { name: 'Network', value: 12, color: '#fbbf24' },
];
