/** Local domain context shown alongside Flex imports (demo). */

export type PartnerAppId = 'eztrac' | 'rpt';

export interface EzTracInitiativeRef {
  initiativeId: string;
  initiativeName: string;
  status: string;
}

export interface EzTracBudgetRef {
  initiativeId: string;
  fiscalYear: number;
  amount: number;
}

export interface DhubSquadRef {
  id: string;
  name: string;
  capacity: number;
  currentCapacity: number;
}

export interface EzTracLocalContext {
  kind: 'eztrac';
  initiatives: EzTracInitiativeRef[];
  budgets: EzTracBudgetRef[];
  expectedFlexDatasets: { name: string; purpose: string }[];
  activeInitiativeCount: number;
  fiscalYear: number;
}

export interface DhubLocalContext {
  kind: 'dhub';
  squads: DhubSquadRef[];
  pendingTransfers: number;
  capacityUtilizationPct: number;
  overAllocatedSquads: number;
  expectedFlexDatasets: { name: string; purpose: string }[];
}

export type PartnerLocalContext = EzTracLocalContext | DhubLocalContext;

export function getPartnerLocalContext(appId: PartnerAppId): PartnerLocalContext {
  if (appId === 'eztrac') {
    return {
      kind: 'eztrac',
      fiscalYear: 2026,
      activeInitiativeCount: 3,
      initiatives: [
        { initiativeId: 'INIT-CLOUD-OPS-2026', initiativeName: 'Cloud Operations Modernization', status: 'Active' },
        { initiativeId: 'INIT-DATA-PLATFORM', initiativeName: 'Enterprise Data Platform', status: 'Active' },
        { initiativeId: 'INIT-FINOPS-FORECAST', initiativeName: 'FinOps Forecasting Enablement', status: 'Planning' },
      ],
      budgets: [
        { initiativeId: 'INIT-CLOUD-OPS-2026', fiscalYear: 2026, amount: 2_450_000 },
        { initiativeId: 'INIT-DATA-PLATFORM', fiscalYear: 2026, amount: 890_000 },
        { initiativeId: 'INIT-FINOPS-FORECAST', fiscalYear: 2026, amount: 320_000 },
      ],
      expectedFlexDatasets: [
        { name: 'cloud_cost_daily', purpose: 'Q3 forecast model refresh' },
        { name: 'finops_kpi_bundle', purpose: 'Executive dashboard sync' },
        { name: 'anomaly_summary_export', purpose: 'Risk-adjusted forecast' },
        { name: 'forecast_variance', purpose: 'Variance vs budget analysis' },
      ],
    };
  }

  return {
    kind: 'dhub',
    squads: [
      { id: 's1', name: 'Data Explorer Agent', capacity: 10, currentCapacity: 8 },
      { id: 's2', name: 'FinOps Platform Squad', capacity: 12, currentCapacity: 11 },
      { id: 's3', name: 'Resource Planning Core', capacity: 8, currentCapacity: 9 },
    ],
    pendingTransfers: 5,
    capacityUtilizationPct: 79,
    overAllocatedSquads: 2,
    expectedFlexDatasets: [
      { name: 'allocation_matrix', purpose: 'Capacity planning cycle' },
      { name: 'resource_utilization_snapshots', purpose: 'Utilization vs allocation' },
      { name: 'capacity_forecast', purpose: 'Squad capacity planning' },
      { name: 'cloud_cost_daily', purpose: 'Capacity cost correlation' },
    ],
  };
}
