export type AppId = 'flex' | 'eztrac' | 'dhub-rpt';

export interface ConnectedApp {
  id: Exclude<AppId, 'flex'>;
  name: string;
  description: string;
  status: 'connected' | 'pending' | 'disconnected';
  lastSync: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
}

export interface DataRequest {
  id: string;
  fromApp: Exclude<AppId, 'flex'>;
  dataset: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  recordCount: number;
  purpose: string;
}

export interface PublishedDataset {
  id: string;
  name: string;
  description: string;
  schema: string[];
  consumers: Exclude<AppId, 'flex'>[];
  lastPublished: string;
  status: 'active' | 'draft';
  recordCount: number;
}

export interface CloudUsagePoint {
  date: string;
  compute: number;
  storage: number;
  network: number;
  database: number;
}

export interface ResourceAllocation {
  id: string;
  name: string;
  team: string;
  allocated: number;
  used: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Anomaly {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  service: string;
  detectedAt: string;
  impact: string;
  status: 'open' | 'investigating' | 'resolved';
  deltaPercent: number;
  assignedOwner?: string;
  assignedSquad?: string;
  assignedAt?: string;
}

export interface KpiSnapshot {
  totalSpend: number;
  spendChange: number;
  utilization: number;
  activeResources: number;
  openAnomalies: number;
  pendingApprovals: number;
}

export interface ForecastSlice {
  month: string;
  actual?: number;
  forecast: number;
  budget: number;
}

export type TransferDirection = 'inbound' | 'outbound';

export interface TransferLogEntry {
  id: string;
  at: string;
  direction: TransferDirection;
  from: AppId;
  to: AppId;
  dataset: string;
  recordCount: number;
  status: 'requested' | 'approved' | 'rejected' | 'published' | 'delivered';
  message: string;
}
