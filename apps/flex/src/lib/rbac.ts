import type { DataRequest, PublishedDataset } from '../types';

export type UserRole = 'admin' | 'finance' | 'platform' | 'viewer';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  finance: 'Finance Approver',
  platform: 'Platform Approver',
  viewer: 'Viewer (read-only)',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access — approve all requests, publish all datasets',
  finance: 'Approve EzTrac inbound requests; publish finance datasets',
  platform: 'Approve dhub-rpt requests; publish allocation & infra datasets',
  viewer: 'Read dashboards only — no approve or publish actions',
};

export function canApproveRequest(role: UserRole, request: DataRequest): boolean {
  if (role === 'viewer') return false;
  if (role === 'admin') return true;
  if (role === 'finance') return request.fromApp === 'eztrac';
  if (role === 'platform') return request.fromApp === 'dhub-rpt';
  return false;
}

export function canPublishDataset(role: UserRole, dataset: PublishedDataset): boolean {
  if (role === 'viewer') return false;
  if (role === 'admin') return true;
  const financeDatasets = ['finops_kpi_bundle', 'cloud_cost_daily', 'anomaly_feed'];
  const platformDatasets = ['allocation_matrix', 'anomaly_feed'];
  if (role === 'finance') return financeDatasets.includes(dataset.name);
  if (role === 'platform') return platformDatasets.includes(dataset.name);
  return false;
}

export function canResolveAnomaly(role: UserRole): boolean {
  return role !== 'viewer';
}

export function rbacDenyMessage(role: UserRole, action: string): string {
  return `Your role (${ROLE_LABELS[role]}) cannot ${action}. Switch role in Settings or contact an admin.`;
}
