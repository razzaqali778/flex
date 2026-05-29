/**
 * Cost optimization only — no workflow duplicates (approvals/anomalies live elsewhere).
 */

export type SavingsStage = 'identified' | 'approved' | 'implementing' | 'realized';

export interface SavingsOpportunity {
  id: string;
  title: string;
  category: 'compute' | 'storage' | 'rightsizing' | 'commitment';
  monthlySavings: number;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  action: string;
  stage: SavingsStage;
  owner: string;
  realizedSavings?: number;
}

export const savingsOpportunities: SavingsOpportunity[] = [
  {
    id: 's1',
    title: 'Rightsize EC2 in us-east-1',
    category: 'rightsizing',
    monthlySavings: 12400,
    effort: 'low',
    confidence: 92,
    action: 'Downsize 14 instances from m5.2xlarge → m5.xlarge',
    stage: 'implementing',
    owner: 'Platform',
  },
  {
    id: 's2',
    title: 'Delete unattached EBS volumes',
    category: 'storage',
    monthlySavings: 2100,
    effort: 'low',
    confidence: 98,
    action: 'Remove 23 volumes · 4.2 TB',
    stage: 'realized',
    owner: 'Cloud Ops',
    realizedSavings: 2100,
  },
  {
    id: 's3',
    title: 'Savings Plan coverage gap',
    category: 'commitment',
    monthlySavings: 8700,
    effort: 'medium',
    confidence: 85,
    action: 'Increase Compute SP by $18K/mo',
    stage: 'approved',
    owner: 'Finance',
  },
];

export const totalIdentifiedSavings = savingsOpportunities.reduce(
  (sum, s) => sum + s.monthlySavings,
  0
);
