/** Showback / chargeback by team — Finance + Cloud accountability */

export interface ChargebackRow {
  id: string;
  team: string;
  costCenter: string;
  initiative: string;
  owner: string;
  monthlySpend: number;
  budget: number;
  forecast: number;
  headcount: number;
  costPerEngineer: number;
  tagCompliance: number;
  trend: 'up' | 'down' | 'stable';
}

export const chargebackRows: ChargebackRow[] = [
  {
    id: 'cb1',
    team: 'Platform Engineering',
    costCenter: 'CC-4100',
    initiative: 'INIT-CLOUD-OPS',
    owner: 'S. Chen',
    monthlySpend: 142500,
    budget: 135000,
    forecast: 148200,
    headcount: 24,
    costPerEngineer: 5938,
    tagCompliance: 94,
    trend: 'up',
  },
  {
    id: 'cb2',
    team: 'Data Platform',
    costCenter: 'CC-4200',
    initiative: 'INIT-DATA-PLATFORM',
    owner: 'M. Patel',
    monthlySpend: 78400,
    budget: 82000,
    forecast: 79100,
    headcount: 18,
    costPerEngineer: 4356,
    tagCompliance: 88,
    trend: 'stable',
  },
  {
    id: 'cb3',
    team: 'Product Engineering',
    costCenter: 'CC-4300',
    initiative: 'INIT-PRODUCT-CORE',
    owner: 'J. Rivera',
    monthlySpend: 36800,
    budget: 40000,
    forecast: 36200,
    headcount: 32,
    costPerEngineer: 1150,
    tagCompliance: 72,
    trend: 'down',
  },
  {
    id: 'cb4',
    team: 'Finance Systems',
    costCenter: 'CC-1100',
    initiative: 'INIT-FIN-OPS',
    owner: 'A. Okonkwo',
    monthlySpend: 12400,
    budget: 15000,
    forecast: 12800,
    headcount: 6,
    costPerEngineer: 2067,
    tagCompliance: 100,
    trend: 'stable',
  },
  {
    id: 'cb5',
    team: 'Security & Compliance',
    costCenter: 'CC-5100',
    initiative: 'INIT-SEC-GOV',
    owner: 'L. Kim',
    monthlySpend: 14650,
    budget: 14000,
    forecast: 14900,
    headcount: 8,
    costPerEngineer: 1831,
    tagCompliance: 96,
    trend: 'up',
  },
];

export const totalChargebackSpend = chargebackRows.reduce((s, r) => s + r.monthlySpend, 0);
export const totalChargebackBudget = chargebackRows.reduce((s, r) => s + r.budget, 0);
