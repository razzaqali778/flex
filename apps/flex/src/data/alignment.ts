/**
 * Cross-app alignment — unique view: Flex cloud vs EzTrac budget vs dhub-rpt capacity.
 * Not shown elsewhere in the app.
 */

export interface AlignmentRow {
  id: string;
  domain: string;
  flexMetric: string;
  flexValue: number;
  eztracMetric?: string;
  eztracValue?: number;
  dhubMetric?: string;
  dhubValue?: number;
  variancePct: number;
  status: 'aligned' | 'drift' | 'conflict';
  note: string;
}

export const alignmentRows: AlignmentRow[] = [
  {
    id: 'a1',
    domain: 'Q2 cloud spend',
    flexMetric: 'Actual (Flex)',
    flexValue: 272000,
    eztracMetric: 'Forecast (EzTrac)',
    eztracValue: 278000,
    dhubMetric: 'Capacity cost est.',
    dhubValue: 265000,
    variancePct: 2.2,
    status: 'aligned',
    note: 'Within 5% across all three systems',
  },
  {
    id: 'a2',
    domain: 'Platform engineering',
    flexMetric: 'EC2 spend',
    flexValue: 142500,
    eztracMetric: 'INIT-CLOUD-OPS budget burn',
    eztracValue: 168200,
    dhubMetric: 'FinOps squad utilization',
    dhubValue: 92,
    variancePct: 15.3,
    status: 'drift',
    note: 'EzTrac effort spend higher than Flex infra line — allocation mismatch',
  },
  {
    id: 'a3',
    domain: 'Data platform',
    flexMetric: 'RDS + Redshift',
    flexValue: 78400,
    eztracMetric: 'INIT-DATA-PLATFORM budget',
    eztracValue: 89000,
    variancePct: 11.9,
    status: 'drift',
    note: 'Budget headroom in EzTrac not reflected in Flex anomaly alerts yet',
  },
  {
    id: 'a4',
    domain: 'Resource Planning Core',
    flexMetric: 'Allocated vCPU',
    flexValue: 32,
    dhubMetric: 'Squad capacity used',
    dhubValue: 36,
    variancePct: 12.5,
    status: 'conflict',
    note: 'dhub-rpt over 100% — Flex allocation_matrix not updated after last transfer',
  },
  {
    id: 'a5',
    domain: 'FinOps forecasting',
    flexMetric: 'Published datasets',
    flexValue: 3,
    eztracMetric: 'Consumed datasets',
    eztracValue: 4,
    variancePct: 25,
    status: 'conflict',
    note: 'EzTrac waiting on anomaly_feed — draft in Flex not published',
  },
];

export const alignmentScore = Math.round(
  (alignmentRows.filter((r) => r.status === 'aligned').length / alignmentRows.length) * 100
);
