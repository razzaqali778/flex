import { eztracConsumedDatasets } from '../data/partners/eztracMocks';
import { dhubConsumedDatasets } from '../data/partners/dhubRptMocks';
import type { FlexState } from '../store/flexTypes';
import type { AppId } from '../types';

export type PartnerId = Exclude<AppId, 'flex'>;
export type ConsumptionStatus = 'consuming' | 'waiting' | 'stale' | 'not_published';

export interface PartnerConsumptionRow {
  datasetName: string;
  purpose: string;
  recordCount: number;
  status: ConsumptionStatus;
  lastConsumedAt: string | null;
  schema: string[];
}

const CATALOG: Record<PartnerId, { name: string; purpose: string; recordCount: number }[]> = {
  eztrac: eztracConsumedDatasets,
  'dhub-rpt': dhubConsumedDatasets,
};

const PARTNER_LABELS: Record<PartnerId, string> = {
  eztrac: 'EzTrac',
  'dhub-rpt': 'dhub-rpt (RTP)',
};

export function partnerLabel(id: PartnerId): string {
  return PARTNER_LABELS[id];
}

/** Live view of what each partner consumes from Flex published datasets */
export function getPartnerConsumption(state: FlexState, partner: PartnerId): PartnerConsumptionRow[] {
  const catalog = CATALOG[partner];
  const seen = new Set<string>();

  const rows: PartnerConsumptionRow[] = catalog.map((cat) => {
    seen.add(cat.name);
    const published = state.publishedDatasets.find((d) => d.name === cat.name);
    return rowFromPublished(partner, cat.name, cat.purpose, cat.recordCount, published);
  });

  // Also show any active datasets published to this partner but not in static catalog
  for (const ds of state.publishedDatasets) {
    if (seen.has(ds.name) || !ds.consumers.includes(partner)) continue;
    rows.push(rowFromPublished(partner, ds.name, ds.description, ds.recordCount, ds));
  }

  return rows.sort((a, b) => {
    const order: Record<ConsumptionStatus, number> = { consuming: 0, stale: 1, waiting: 2, not_published: 3 };
    return order[a.status] - order[b.status] || a.datasetName.localeCompare(b.datasetName);
  });
}

function rowFromPublished(
  partner: PartnerId,
  name: string,
  purpose: string,
  fallbackRecords: number,
  published: FlexState['publishedDatasets'][0] | undefined
): PartnerConsumptionRow {
  if (!published || published.status !== 'active') {
    const waiting = published?.status === 'draft';
    return {
      datasetName: name,
      purpose,
      recordCount: published?.recordCount ?? fallbackRecords,
      status: waiting ? 'waiting' : 'not_published',
      lastConsumedAt: null,
      schema: published?.schema ?? [],
    };
  }

  if (!published.consumers.includes(partner)) {
    return {
      datasetName: name,
      purpose,
      recordCount: published.recordCount,
      status: 'not_published',
      lastConsumedAt: null,
      schema: published.schema,
    };
  }

  const ageMs = published.lastPublished
    ? Date.now() - new Date(published.lastPublished).getTime()
    : Infinity;
  const stale = ageMs > 7 * 24 * 60 * 60 * 1000;

  return {
    datasetName: name,
    purpose: published.description || purpose,
    recordCount: published.recordCount,
    status: stale ? 'stale' : 'consuming',
    lastConsumedAt: published.lastPublished || null,
    schema: published.schema,
  };
}

export function countConsuming(state: FlexState, partner: PartnerId): number {
  return getPartnerConsumption(state, partner).filter((r) => r.status === 'consuming').length;
}

export function countWaiting(state: FlexState, partner: PartnerId): number {
  return getPartnerConsumption(state, partner).filter((r) => r.status === 'waiting').length;
}
