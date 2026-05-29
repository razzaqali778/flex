import type { PublishedDataset } from '../types';

export interface FieldBoundary {
  field: string;
  classification: 'public' | 'internal' | 'restricted' | 'pii';
  included: boolean;
  reason?: string;
}

const CLASSIFICATION_MAP: Record<string, FieldBoundary['classification']> = {
  date: 'public',
  service: 'public',
  region: 'public',
  amount_usd: 'internal',
  team: 'internal',
  resource: 'internal',
  allocated: 'internal',
  used: 'internal',
  unit: 'public',
  kpi: 'public',
  value: 'internal',
  period: 'public',
  id: 'internal',
  severity: 'public',
  impact: 'internal',
  owner: 'pii',
  'owner-email': 'pii',
  email: 'pii',
};

export function buildFieldBoundary(dataset: PublishedDataset): FieldBoundary[] {
  return dataset.schema.map((field) => {
    const classification = CLASSIFICATION_MAP[field] ?? 'internal';
    const piiLike = classification === 'pii';
    return {
      field,
      classification,
      included: !piiLike,
      reason: piiLike ? 'Excluded — PII not permitted in partner feed' : undefined,
    };
  });
}

export function boundarySummary(boundaries: FieldBoundary[]): {
  included: string[];
  excluded: string[];
} {
  return {
    included: boundaries.filter((b) => b.included).map((b) => b.field),
    excluded: boundaries.filter((b) => !b.included).map((b) => b.field),
  };
}
