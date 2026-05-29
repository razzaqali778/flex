/** Demo Slack / Teams approval notification (simulated) */

export interface SlackApprovalPayload {
  requestId: string;
  dataset: string;
  fromApp: string;
  recordCount: number;
  purpose: string;
  approveUrl: string;
}

export function formatSlackMessage(payload: SlackApprovalPayload): string {
  return [
    ':shield: *Flex — Approval required*',
    `*Dataset:* \`${payload.dataset}\``,
    `*From:* ${payload.fromApp}`,
    `*Records:* ${payload.recordCount.toLocaleString()}`,
    `*Purpose:* ${payload.purpose}`,
    `<${payload.approveUrl}|Review in Flex Data Exchange>`,
  ].join('\n');
}

export async function simulateSlackNotify(payload: SlackApprovalPayload): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600));
  console.info('[Flex Slack demo]', formatSlackMessage(payload));
  return true;
}

export interface SlackOutcomePayload {
  outcome: 'approved' | 'rejected';
  dataset: string;
  fromApp: string;
  recordCount: number;
  channel: string;
  audienceLabel: string;
}

export function formatOutcomeMessage(payload: SlackOutcomePayload): string {
  const verb = payload.outcome === 'approved' ? 'Approved & delivered' : 'Rejected';
  const emoji = payload.outcome === 'approved' ? ':white_check_mark:' : ':x:';
  return [
    `${emoji} *Flex — ${verb}*`,
    `*Dataset:* \`${payload.dataset}\``,
    `*Partner:* ${payload.fromApp}`,
    `*Records:* ${payload.recordCount.toLocaleString()}`,
    `*Notified:* ${payload.audienceLabel} · #${payload.channel}`,
  ].join('\n');
}

/** Preview before Slack send — shows intended recipient */
export function formatOutcomePreview(payload: Omit<SlackOutcomePayload, 'audienceLabel'> & { audienceLabel?: string }): string {
  const verb = payload.outcome === 'approved' ? 'Approved & delivered' : 'Rejected';
  const emoji = payload.outcome === 'approved' ? ':white_check_mark:' : ':x:';
  const target = payload.audienceLabel ?? 'stakeholder';
  return [
    `${emoji} *Flex — ${verb}*`,
    `*Dataset:* \`${payload.dataset}\``,
    `*Partner:* ${payload.fromApp}`,
    `*Records:* ${payload.recordCount.toLocaleString()}`,
    `*Notify:* ${target} · #${payload.channel}`,
  ].join('\n');
}

export async function simulateOutcomeNotify(payload: SlackOutcomePayload): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500));
  console.info('[Flex Slack demo]', formatOutcomeMessage(payload));
  return true;
}
