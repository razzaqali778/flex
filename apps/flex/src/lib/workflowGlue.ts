import type { Anomaly, DataRequest } from '../types';
import type { AlignmentRow } from '../data/alignment';

/** dhub-rpt squad contacts — not a calendar; ownership for incidents & planning */
export interface DhubSquadOwner {
  id: string;
  name: string;
  squad: string;
  platformLead: string;
  dhubRole: string;
  teamsChannel: string;
}

export const dhubSquadOwners: DhubSquadOwner[] = [
  {
    id: 'own1',
    name: 'Maya Chen',
    squad: 'FinOps',
    platformLead: 'Platform Engineering',
    dhubRole: 'Capacity planner',
    teamsChannel: 'finops-planning',
  },
  {
    id: 'own2',
    name: 'Jordan Park',
    squad: 'Data Ingest',
    platformLead: 'Data Platform',
    dhubRole: 'Resource planner',
    teamsChannel: 'data-platform-planning',
  },
  {
    id: 'own3',
    name: 'Alex Rivera',
    squad: 'SRE',
    platformLead: 'Platform Engineering',
    dhubRole: 'Infra owner',
    teamsChannel: 'platform-sre',
  },
  {
    id: 'own4',
    name: 'Sam Okonkwo',
    squad: 'ML Platform',
    platformLead: 'Data Platform',
    dhubRole: 'GPU capacity lead',
    teamsChannel: 'ml-platform',
  },
];

const serviceOwnerMap: Record<string, string[]> = {
  EC2: ['own1', 'own3'],
  EBS: ['own3', 'own1'],
  S3: ['own2', 'own4'],
  RDS: ['own2'],
  Lambda: ['own3'],
};

export function teamsChannelUrl(channel: string): string {
  return `https://teams.microsoft.com/l/channel/19%3a${encodeURIComponent(channel)}%40thread.tacv2/demo`;
}

export function notifyTargetForRequest(
  request: DataRequest,
  outcome: 'approved' | 'rejected'
): { label: string; channel: string; audience: 'finance' | 'platform' } {
  if (request.fromApp === 'eztrac') {
    return {
      label: outcome === 'approved' ? 'Finance' : 'Finance (rejection notice)',
      channel: 'finops-approvals',
      audience: 'finance',
    };
  }
  return {
    label: outcome === 'approved' ? 'Platform' : 'Platform (rejection notice)',
    channel: 'platform-capacity',
    audience: 'platform',
  };
}

export function suggestOwnersForAnomaly(anomaly: Anomaly): DhubSquadOwner[] {
  const ids = serviceOwnerMap[anomaly.service] ?? ['own1', 'own3'];
  return ids
    .map((id) => dhubSquadOwners.find((o) => o.id === id))
    .filter((o): o is DhubSquadOwner => Boolean(o));
}

export interface AlignmentWorkflowAction {
  id: string;
  label: string;
  kind: 'teams' | 'dhub-sync' | 'exchange';
  href?: string;
  route?: string;
  hint: string;
}

export function alignmentWorkflowActions(row: AlignmentRow): AlignmentWorkflowAction[] {
  if (row.status === 'aligned') return [];

  const actions: AlignmentWorkflowAction[] = [];

  if (row.status === 'conflict' && row.dhubMetric) {
    actions.push({
      id: 'dhub-sync',
      label: 'Open dhub-rpt transfer request',
      kind: 'dhub-sync',
      route: '/govern/partners',
      hint: 'Simulate inbound capacity sync from dhub-rpt',
    });
  }

  if (row.status === 'conflict' && row.eztracMetric && row.id === 'a5') {
    actions.push({
      id: 'exchange',
      label: 'Publish in Data Exchange',
      kind: 'exchange',
      route: '/govern/exchange',
      hint: 'EzTrac waiting on anomaly_feed draft',
    });
  }

  const channel =
    row.domain.includes('FinOps') || row.eztracMetric
      ? 'finops-planning'
      : row.dhubMetric
        ? 'platform-capacity'
        : 'finops-planning';

  actions.push({
    id: 'teams',
    label: 'Open planning discussion',
    kind: 'teams',
    href: teamsChannelUrl(channel),
    hint: `Teams · #${channel}`,
  });

  return actions;
}

export interface WorkflowNotificationRecord {
  outcome: 'approved' | 'rejected';
  dataset: string;
  fromApp: string;
  recordCount: number;
  channel: string;
  audienceLabel: string;
  audience: 'finance' | 'platform';
  at: string;
  slackSent: boolean;
}

export function buildOutcomeNotification(
  request: DataRequest,
  outcome: 'approved' | 'rejected'
): {
  target: ReturnType<typeof notifyTargetForRequest>;
  appLabel: string;
  desktopTitle: string;
  desktopBody: string;
  record: Omit<WorkflowNotificationRecord, 'at' | 'slackSent'>;
} {
  const target = notifyTargetForRequest(request, outcome);
  const appLabel = request.fromApp === 'eztrac' ? 'EzTrac' : 'dhub-rpt';
  const desktopTitle =
    outcome === 'approved'
      ? `Flex — Approved: ${request.dataset}`
      : `Flex — Rejected: ${request.dataset}`;
  const desktopBody =
    outcome === 'approved'
      ? `${appLabel} · ${request.recordCount.toLocaleString()} rows transferred. Tap to notify ${target.label}.`
      : `${appLabel} request denied. Tap to notify ${target.label}.`;

  return {
    target,
    appLabel,
    desktopTitle,
    desktopBody,
    record: {
      outcome,
      dataset: request.dataset,
      fromApp: appLabel,
      recordCount: request.recordCount,
      channel: target.channel,
      audienceLabel: target.label,
      audience: target.audience,
    },
  };
}
