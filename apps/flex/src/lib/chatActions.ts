import { alignmentScore } from '../data/alignment';
import type { Anomaly, DataRequest, KpiSnapshot, PublishedDataset } from '../types';

export type ChatActionType =
  | 'approve_request'
  | 'reject_request'
  | 'publish_dataset'
  | 'resolve_anomaly';

export interface ChatAction {
  id: string;
  type: ChatActionType;
  label: string;
  description: string;
  targetId: string;
  status: 'pending' | 'executed' | 'dismissed';
}

interface FlexSnapshot {
  dataRequests: DataRequest[];
  publishedDatasets: PublishedDataset[];
  anomalies: Anomaly[];
  kpis: KpiSnapshot;
}

export function detectChatActions(query: string, snapshot: FlexSnapshot): ChatAction[] {
  const q = query.toLowerCase();
  const actions: ChatAction[] = [];
  const wantsAction =
    /\b(approve|reject|publish|resolve|fix|do it|go ahead|can you|please)\b/.test(q) ||
    /\b(should i|what should)\b/.test(q);

  if (!wantsAction) return actions;

  const pending = snapshot.dataRequests.filter((r) => r.status === 'pending');
  const draft = snapshot.publishedDatasets.filter((d) => d.status === 'draft');
  const openAnomalies = snapshot.anomalies.filter((a) => a.status !== 'resolved');

  if (/\b(approv|accept|grant)\b/.test(q) && pending.length > 0) {
    const target = pending[0];
    actions.push({
      id: `act-approve-${target.id}`,
      type: 'approve_request',
      label: `Approve ${target.dataset}`,
      description: `${target.recordCount.toLocaleString()} rows from ${target.fromApp === 'eztrac' ? 'EzTrac' : 'dhub-rpt'}`,
      targetId: target.id,
      status: 'pending',
    });
  }

  if (/\b(reject|deny|decline)\b/.test(q) && pending.length > 0) {
    const target = pending[0];
    actions.push({
      id: `act-reject-${target.id}`,
      type: 'reject_request',
      label: `Reject ${target.dataset}`,
      description: `Block inbound sync from ${target.fromApp === 'eztrac' ? 'EzTrac' : 'dhub-rpt'}`,
      targetId: target.id,
      status: 'pending',
    });
  }

  if (/\b(publish|send|release)\b/.test(q) && draft.length > 0) {
    const target =
      draft.find((d) => q.includes('anomaly') && d.name.includes('anomaly')) ?? draft[0];
    actions.push({
      id: `act-publish-${target.id}`,
      type: 'publish_dataset',
      label: `Publish ${target.name}`,
      description: 'Send to EzTrac & dhub-rpt consumers',
      targetId: target.id,
      status: 'pending',
    });
  }

  if (/\b(resolve|close|mark resolved)\b/.test(q) && openAnomalies.length > 0) {
    const target =
      openAnomalies.find((a) => a.severity === 'critical') ??
      openAnomalies.find((a) => a.severity === 'high') ??
      openAnomalies[0];
    actions.push({
      id: `act-resolve-${target.id}`,
      type: 'resolve_anomaly',
      label: `Resolve ${target.title}`,
      description: `${target.severity} · ${target.service}`,
      targetId: target.id,
      status: 'pending',
    });
  }

  if (
    actions.length === 0 &&
    /\b(pending|approval|exchange)\b/.test(q) &&
    pending.length > 0
  ) {
    const target = pending[0];
    actions.push({
      id: `act-approve-${target.id}`,
      type: 'approve_request',
      label: `Approve ${target.dataset}`,
      description: `${pending.length} pending — start with this one`,
      targetId: target.id,
      status: 'pending',
    });
  }

  if (
    actions.length === 0 &&
    /\b(conflict|alignment|drift)\b/.test(q) &&
    alignmentScore < 80 &&
    draft.some((d) => d.name === 'anomaly_feed')
  ) {
    const feed = draft.find((d) => d.name === 'anomaly_feed')!;
    actions.push({
      id: `act-publish-${feed.id}`,
      type: 'publish_dataset',
      label: 'Publish anomaly_feed',
      description: 'Fixes EzTrac forecasting conflict on Alignment',
      targetId: feed.id,
      status: 'pending',
    });
  }

  return actions.slice(0, 2);
}
