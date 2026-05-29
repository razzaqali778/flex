import type { Anomaly, TransferLogEntry } from '../types';

export interface AnomalyStoryPhase {
  id: string;
  phase: 'detected' | 'correlated' | 'action' | 'resolved';
  title: string;
  detail: string;
  at: string;
}

export function buildAnomalyStory(
  anomaly: Anomaly,
  transferLog: TransferLogEntry[]
): AnomalyStoryPhase[] {
  const detected: AnomalyStoryPhase = {
    id: `${anomaly.id}-d`,
    phase: 'detected',
    title: 'Anomaly detected',
    detail: `${anomaly.title} — ${anomaly.impact} (${anomaly.severity})`,
    at: anomaly.detectedAt,
  };

  const correlated = transferLog
    .filter(
      (t) =>
        t.message.toLowerCase().includes(anomaly.service.toLowerCase()) ||
        t.dataset.toLowerCase().includes('anomaly') ||
        (anomaly.service === 'EC2' && t.message.includes('cloud'))
    )
    .slice(0, 2)
    .map((t, i) => ({
      id: `${anomaly.id}-c${i}`,
      phase: 'correlated' as const,
      title: 'Correlated transfer event',
      detail: t.message,
      at: t.at,
    }));

  const deployPhase: AnomalyStoryPhase = {
    id: `${anomaly.id}-deploy`,
    phase: 'correlated',
    title: 'Deploy correlation (demo)',
    detail:
      anomaly.severity === 'critical'
        ? 'Coincides with deploy platform-api v2.14.0 (+34% EC2 in us-east-1)'
        : 'No deploy correlation in last 24h — likely config drift',
    at: new Date(new Date(anomaly.detectedAt).getTime() - 7200000).toISOString(),
  };

  const action: AnomalyStoryPhase = {
    id: `${anomaly.id}-a`,
    phase: 'action',
    title: anomaly.status === 'resolved' ? 'Remediation applied' : 'Recommended action',
    detail:
      anomaly.status === 'resolved'
        ? 'Rightsizing applied · anomaly marked resolved in Flex'
        : 'Review in Optimization → rightsizing recommendations · publish anomaly_feed to EzTrac',
    at: anomaly.detectedAt,
  };

  const resolved: AnomalyStoryPhase | null =
    anomaly.status === 'resolved'
      ? {
          id: `${anomaly.id}-r`,
          phase: 'resolved',
          title: 'Closed',
          detail: 'Resolved — removed from open anomalies KPI',
          at: new Date(new Date(anomaly.detectedAt).getTime() + 86400000).toISOString(),
        }
      : null;

  return [detected, deployPhase, ...correlated, action, ...(resolved ? [resolved] : [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}
