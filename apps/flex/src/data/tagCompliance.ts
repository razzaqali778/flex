export interface TagComplianceRule {
  id: string;
  tag: string;
  required: boolean;
  coveragePct: number;
  untaggedSpend: number;
  owner: string;
}

export const tagComplianceRules: TagComplianceRule[] = [
  { id: 't1', tag: 'cost-center', required: true, coveragePct: 91, untaggedSpend: 24800, owner: 'Finance' },
  { id: 't2', tag: 'team', required: true, coveragePct: 87, untaggedSpend: 31200, owner: 'Platform' },
  { id: 't3', tag: 'environment', required: true, coveragePct: 96, untaggedSpend: 8400, owner: 'DevOps' },
  { id: 't4', tag: 'initiative', required: false, coveragePct: 74, untaggedSpend: 45600, owner: 'Finance' },
  { id: 't5', tag: 'owner-email', required: false, coveragePct: 68, untaggedSpend: 52100, owner: 'HR / IT' },
];

export const overallTagCompliance = Math.round(
  tagComplianceRules.filter((t) => t.required).reduce((s, t) => s + t.coveragePct, 0) /
    tagComplianceRules.filter((t) => t.required).length
);

export const untaggedSpendTotal = tagComplianceRules.reduce((s, t) => s + t.untaggedSpend, 0);
