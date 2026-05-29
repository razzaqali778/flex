export interface MeetingStep {
  id: string;
  label: string;
  hint: string;
  route: string;
  check: (ctx: MeetingContext) => boolean;
}

export interface MeetingContext {
  pendingCount: number;
  openAnomalies: number;
  hasApprovedRequest: boolean;
  hasPublishedDraft: boolean;
  hasResolvedAnomaly: boolean;
  alignmentScore: number;
}

export const MEETING_STEPS: MeetingStep[] = [
  {
    id: 'm1',
    label: 'Review dashboard KPIs',
    hint: 'Open command center',
    route: '/',
    check: () => true,
  },
  {
    id: 'm2',
    label: 'Check cross-app alignment',
    hint: 'Alignment score & conflicts',
    route: '/govern/alignment',
    check: (c) => c.alignmentScore > 0,
  },
  {
    id: 'm3',
    label: 'Simulate EzTrac inbound request',
    hint: 'Integrations → Simulate sync',
    route: '/govern/partners',
    check: (c) => c.pendingCount > 0 || c.hasApprovedRequest,
  },
  {
    id: 'm4',
    label: 'Preview & approve a request',
    hint: 'Exchange → Preview impact',
    route: '/govern/exchange',
    check: (c) => c.hasApprovedRequest,
  },
  {
    id: 'm5',
    label: 'Resolve an anomaly',
    hint: 'Anomalies → Resolve',
    route: '/anomalies',
    check: (c) => c.hasResolvedAnomaly || c.openAnomalies === 0,
  },
  {
    id: 'm6',
    label: 'Publish anomaly_feed',
    hint: 'Exchange → Review & publish',
    route: '/govern/exchange',
    check: (c) => c.hasPublishedDraft,
  },
];

export function meetingProgress(ctx: MeetingContext): number {
  const done = MEETING_STEPS.filter((s) => s.check(ctx)).length;
  return Math.round((done / MEETING_STEPS.length) * 100);
}
