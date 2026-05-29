import type { FlexState } from '../store/flexTypes';
import type { UserRole } from './rbac';
import { ROLE_LABELS } from './rbac';
import { alignmentScore } from '../data/alignment';
import { totalIdentifiedSavings } from '../data/insights';

export interface AuditBundle {
  version: string;
  generatedAt: string;
  actor: { role: UserRole; label: string };
  integrity: { algorithm: string; hash: string; signature: string };
  summary: Record<string, string | number>;
  events: AuditEvent[];
  markdown: string;
}

export interface AuditEvent {
  seq: number;
  at: string;
  action: string;
  detail: string;
  prevHash: string;
  hash: string;
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}

function chainEvents(
  transferLog: FlexState['transferLog'],
  anomalies: FlexState['anomalies']
): AuditEvent[] {
  const events: AuditEvent[] = [];
  let prevHash = '00000000';

  transferLog.forEach((t, idx) => {
    const payload = `${idx}|${t.at}|${t.status}|${t.message}`;
    const hash = simpleHash(prevHash + payload);
    events.push({
      seq: idx + 1,
      at: t.at,
      action: t.status,
      detail: t.message,
      prevHash,
      hash,
    });
    prevHash = hash;
  });

  anomalies
    .filter((a) => a.status === 'resolved')
    .forEach((a, i) => {
      const payload = `anomaly|${a.id}|${a.title}`;
      const hash = simpleHash(prevHash + payload);
      events.push({
        seq: transferLog.length + i + 1,
        at: a.detectedAt,
        action: 'anomaly_resolved',
        detail: a.title,
        prevHash,
        hash,
      });
      prevHash = hash;
    });

  return events;
}

export function buildAuditBundle(state: FlexState, role: UserRole): AuditBundle {
  const events = chainEvents(state.transferLog, state.anomalies);
  const rootHash = events.length > 0 ? events[events.length - 1].hash : '00000000';
  const signature = `FLEX-DEMO-SIG-${simpleHash(rootHash + role + Date.now())}`;

  const summary = {
    cloudSpend: `$${(state.kpis.totalSpend / 1000).toFixed(1)}K`,
    pendingApprovals: state.dataRequests.filter((r) => r.status === 'pending').length,
    openAnomalies: state.kpis.openAnomalies,
    alignmentScore: `${alignmentScore}%`,
    identifiedSavings: `$${(totalIdentifiedSavings / 1000).toFixed(1)}K/mo`,
    transferEvents: events.length,
  };

  const markdown = [
    '# Flex — Proof-of-Governance Audit Bundle',
    `_Generated ${new Date().toISOString()}_`,
    '',
    '## Integrity',
    `- **Algorithm:** SHA-demo-chain (production: Ed25519)`,
    `- **Root hash:** \`${rootHash}\``,
    `- **Signature:** \`${signature}\``,
    `- **Actor:** ${ROLE_LABELS[role]}`,
    '',
    '## Summary',
    ...Object.entries(summary).map(([k, v]) => `- **${k}:** ${v}`),
    '',
    '## Event chain',
    ...events.slice(0, 20).map((e) => `${e.seq}. [${e.at}] **${e.action}** — ${e.detail} \`#${e.hash}\``),
    events.length > 20 ? `\n_…and ${events.length - 20} more events_` : '',
    '',
    '_Demo bundle — production uses immutable store + HSM signing_',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    version: '2.0-demo',
    generatedAt: new Date().toISOString(),
    actor: { role, label: ROLE_LABELS[role] },
    integrity: { algorithm: 'flex-demo-chain-v1', hash: rootHash, signature },
    summary,
    events,
    markdown,
  };
}

export function downloadAuditBundle(bundle: AuditBundle): void {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flex-audit-bundle-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadAuditMarkdown(bundle: AuditBundle): void {
  const blob = new Blob([bundle.markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flex-audit-bundle-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
