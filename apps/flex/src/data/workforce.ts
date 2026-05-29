/** Squad × infra alignment — HR + dhub-rpt + Flex cloud cost */

export type WorkforceSignal = 'hire' | 'reallocate' | 'stable' | 'optimize';

export interface SquadWorkforceRow {
  id: string;
  squad: string;
  platformLead: string;
  headcount: number;
  capacityUsedPct: number;
  cloudCostMonthly: number;
  costPerHead: number;
  dhubCapacityUnits: number;
  flexAllocatedVcpu: number;
  signal: WorkforceSignal;
  signalReason: string;
}

export const squadWorkforceRows: SquadWorkforceRow[] = [
  {
    id: 'wf1',
    squad: 'FinOps',
    platformLead: 'Platform Engineering',
    headcount: 8,
    capacityUsedPct: 112,
    cloudCostMonthly: 42800,
    costPerHead: 5350,
    dhubCapacityUnits: 36,
    flexAllocatedVcpu: 32,
    signal: 'reallocate',
    signalReason: 'dhub-rpt at 112% — reallocate vCPU or defer new workloads',
  },
  {
    id: 'wf2',
    squad: 'Data Ingest',
    platformLead: 'Data Platform',
    headcount: 12,
    capacityUsedPct: 94,
    cloudCostMonthly: 31200,
    costPerHead: 2600,
    dhubCapacityUnits: 28,
    flexAllocatedVcpu: 26,
    signal: 'stable',
    signalReason: 'Capacity and cloud spend aligned within 6%',
  },
  {
    id: 'wf3',
    squad: 'Core API',
    platformLead: 'Product Engineering',
    headcount: 22,
    capacityUsedPct: 78,
    cloudCostMonthly: 18400,
    costPerHead: 836,
    dhubCapacityUnits: 40,
    flexAllocatedVcpu: 18,
    signal: 'optimize',
    signalReason: 'Low cloud per head — rightsizing opportunity in Lambda layer',
  },
  {
    id: 'wf4',
    squad: 'ML Platform',
    platformLead: 'Data Platform',
    headcount: 6,
    capacityUsedPct: 118,
    cloudCostMonthly: 52400,
    costPerHead: 8733,
    dhubCapacityUnits: 14,
    flexAllocatedVcpu: 16,
    signal: 'hire',
    signalReason: 'GPU spend rising 34% — squad over capacity, hiring signal for dhub-rpt',
  },
  {
    id: 'wf5',
    squad: 'SRE',
    platformLead: 'Platform Engineering',
    headcount: 10,
    capacityUsedPct: 88,
    cloudCostMonthly: 22100,
    costPerHead: 2210,
    dhubCapacityUnits: 22,
    flexAllocatedVcpu: 20,
    signal: 'stable',
    signalReason: 'Healthy alignment across Flex, EzTrac budget line, and dhub-rpt',
  },
];

export const hiringSignals = squadWorkforceRows.filter((r) => r.signal === 'hire').length;
export const reallocateSignals = squadWorkforceRows.filter((r) => r.signal === 'reallocate').length;
