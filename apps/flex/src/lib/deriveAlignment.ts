import { alignmentRows as baseAlignmentRows, type AlignmentRow } from '../data/alignment';
import type { FlexState } from '../store/flexTypes';

export function computeAlignmentScore(rows: AlignmentRow[]): number {
  if (rows.length === 0) return 0;
  return Math.round((rows.filter((r) => r.status === 'aligned').length / rows.length) * 100);
}

/** Reactive alignment — updates when datasets publish or conflicts are resolved */
export function deriveAlignmentRows(state: FlexState): AlignmentRow[] {
  const activeDatasets = state.publishedDatasets.filter((d) => d.status === 'active').length;
  const anomalyFeedLive = state.publishedDatasets.some(
    (d) => d.name === 'anomaly_feed' && d.status === 'active'
  );

  return state.alignmentRows.map((row) => {
    if (state.resolvedAlignmentIds.includes(row.id)) {
      return { ...row, status: 'aligned' as const, variancePct: 0, note: `${row.note} — resolved in Flex` };
    }
    if (row.id === 'a5' && anomalyFeedLive) {
      return {
        ...row,
        status: 'aligned',
        flexValue: activeDatasets,
        variancePct: 0,
        note: 'anomaly_feed published — EzTrac now consuming',
      };
    }
    if (row.id === 'a4' && state.resolvedAlignmentIds.includes('a4')) {
      return {
        ...row,
        status: 'aligned',
        flexValue: row.dhubValue ?? row.flexValue,
        variancePct: 0,
        note: 'allocation_matrix refreshed after transfer',
      };
    }
    return row;
  });
}

export const initialAlignmentRows: AlignmentRow[] = baseAlignmentRows.map((r) => ({ ...r }));
