import type { ChargebackRow } from '../data/chargeback';
import type { SavingsOpportunity } from '../data/insights';
import type { TagComplianceRule } from '../data/tagCompliance';
import type { SquadWorkforceRow } from '../data/workforce';
import type { AlignmentRow } from '../data/alignment';
import type {
  Anomaly,
  ConnectedApp,
  DataRequest,
  KpiSnapshot,
  PublishedDataset,
  ResourceAllocation,
  TransferLogEntry,
} from '../types';
import type { UserRole } from '../lib/rbac';

export interface FlexSettings {
  userRole: UserRole;
  slackApprovals: boolean;
  presentationMode: boolean;
  meetingMode: boolean;
  spendPulse: boolean;
  desktopNotifications: boolean;
}

export interface FlexState {
  dataRequests: DataRequest[];
  publishedDatasets: PublishedDataset[];
  anomalies: Anomaly[];
  kpis: KpiSnapshot;
  transferLog: TransferLogEntry[];
  savings: SavingsOpportunity[];
  chargeback: ChargebackRow[];
  resourceAllocations: ResourceAllocation[];
  tagRules: TagComplianceRule[];
  workforce: SquadWorkforceRow[];
  connectedApps: ConnectedApp[];
  alignmentRows: AlignmentRow[];
  resolvedAlignmentIds: string[];
  settings: FlexSettings;
}

export type CreateAnomalyInput = Omit<Anomaly, 'id'>;
export type CreateDatasetInput = Omit<PublishedDataset, 'id' | 'lastPublished' | 'status'>;
export type CreateSavingsInput = Omit<SavingsOpportunity, 'id' | 'realizedSavings'>;
