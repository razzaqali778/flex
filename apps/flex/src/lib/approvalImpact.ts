import { alignmentRows } from '../data/alignment';
import type { DataRequest, KpiSnapshot } from '../types';

export interface ApprovalImpact {
  requestId: string;
  partnerLabel: string;
  dataset: string;
  recordCount: number;
  kpiBefore: Pick<KpiSnapshot, 'pendingApprovals' | 'utilization' | 'totalSpend'>;
  kpiAfter: Pick<KpiSnapshot, 'pendingApprovals' | 'utilization' | 'totalSpend'>;
  alignmentBefore: number;
  alignmentAfter: number;
  conflictsResolved: number;
  staleDatasets: string[];
  aiSummary: string;
}

function alignmentScore(): number {
  const aligned = alignmentRows.filter((r) => r.status === 'aligned').length;
  return Math.round((aligned / alignmentRows.length) * 100);
}

function countConflicts(): number {
  return alignmentRows.filter((r) => r.status === 'conflict').length;
}

const APP_LABELS = { eztrac: 'EzTrac', 'dhub-rpt': 'dhub-rpt' } as const;

export function simulateApprovalImpact(
  request: DataRequest,
  kpis: KpiSnapshot
): ApprovalImpact {
  const partnerLabel = APP_LABELS[request.fromApp];
  const before = alignmentScore();
  const conflictsBefore = countConflicts();

  let alignmentDelta = 0;
  let conflictsResolved = 0;
  const staleDatasets: string[] = [];

  const ds = request.dataset.toLowerCase();

  if (request.fromApp === 'eztrac') {
    if (ds.includes('anomaly')) {
      alignmentDelta = 12;
      conflictsResolved = 1;
    } else if (ds.includes('spend') || ds.includes('forecast')) {
      alignmentDelta = 6;
      staleDatasets.push('finops_kpi_bundle');
    } else {
      alignmentDelta = 4;
    }
  }

  if (request.fromApp === 'dhub-rpt') {
    if (ds.includes('utilization') || ds.includes('capacity')) {
      alignmentDelta = 10;
      conflictsResolved = 1;
    } else {
      alignmentDelta = 3;
    }
  }

  const utilizationDelta =
    request.fromApp === 'dhub-rpt' && ds.includes('utilization') ? 1.2 : 0.3;

  const spendDelta =
    request.fromApp === 'eztrac' && ds.includes('spend') ? -1200 : 0;

  const after = Math.min(100, before + alignmentDelta);
  const conflictsAfter = Math.max(0, conflictsBefore - conflictsResolved);

  let aiSummary = `Approving syncs ${request.recordCount.toLocaleString()} rows from ${partnerLabel}. Alignment improves ${before}% → ${after}%.`;
  if (conflictsResolved > 0) {
    aiSummary += ` Resolves ${conflictsResolved} cross-app conflict${conflictsResolved > 1 ? 's' : ''}.`;
  }
  if (staleDatasets.length > 0) {
    aiSummary += ` Note: ${staleDatasets.join(', ')} may need republish after ingest.`;
  }
  if (conflictsAfter > 0) {
    aiSummary += ` ${conflictsAfter} conflict${conflictsAfter > 1 ? 's' : ''} remain on Alignment.`;
  }

  return {
    requestId: request.id,
    partnerLabel,
    dataset: request.dataset,
    recordCount: request.recordCount,
    kpiBefore: {
      pendingApprovals: kpis.pendingApprovals,
      utilization: kpis.utilization,
      totalSpend: kpis.totalSpend,
    },
    kpiAfter: {
      pendingApprovals: Math.max(0, kpis.pendingApprovals - 1),
      utilization: Math.min(100, +(kpis.utilization + utilizationDelta).toFixed(1)),
      totalSpend: kpis.totalSpend + spendDelta,
    },
    alignmentBefore: before,
    alignmentAfter: after,
    conflictsResolved,
    staleDatasets,
    aiSummary,
  };
}
