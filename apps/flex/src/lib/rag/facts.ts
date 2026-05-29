export type ChunkFacts =
  | {
      kind: 'kpi';
      totalSpend: number;
      spendChange: number;
      utilization: number;
      activeResources: number;
      openAnomalies: number;
      pendingApprovals: number;
    }
  | {
      kind: 'anomaly';
      severity: string;
      service: string;
      title: string;
      status: string;
      impact: string;
      detectedAt: string;
      deltaPercent: number;
    }
  | {
      kind: 'request';
      fromApp: string;
      dataset: string;
      status: string;
      recordCount: number;
      purpose: string;
      requestedAt: string;
    }
  | {
      kind: 'dataset';
      name: string;
      description: string;
      status: string;
      consumers: string[];
      recordCount: number;
    }
  | {
      kind: 'cloud-mix';
      period: string;
      compute: number;
      storage: number;
      network: number;
      database: number;
    }
  | { kind: 'service-share'; name: string; percent: number }
  | {
      kind: 'resource';
      name: string;
      team: string;
      allocated: number;
      used: number;
      unit: string;
      trend: string;
      utilizationPct: number;
    }
  | {
      kind: 'integration';
      id: string;
      name: string;
      status: string;
      direction: string;
      lastSync: string;
    }
  | {
      kind: 'transfer';
      direction: string;
      dataset: string;
      from: string;
      to: string;
      recordCount: number;
      status: string;
    }
  | { kind: 'forecast'; month: string; forecast: number; budget: number; actual?: number }
  | { kind: 'partner-domain'; app: string; summary: string }
  | { kind: 'partner-dataset'; app: string; name: string; recordCount: number }
  | {
      kind: 'eztrac-initiative';
      initiativeId: string;
      name: string;
      status: string;
    }
  | { kind: 'eztrac-budget'; initiativeId: string; fiscalYear: number; amount: number }
  | { kind: 'eztrac-forecast'; teamId: string; estimatedCost: number; peopleNumber: number }
  | {
      kind: 'eztrac-spend';
      initiativeId: string;
      directExpenditure: number;
      totalExpenditure: number;
    }
  | { kind: 'eztrac-calendar'; month: string; timeframeId: number; employeeHrs: number }
  | {
      kind: 'dhub-dashboard';
      totalResources: number;
      capacityUtilizationPct: number;
      pendingTransfers: number;
    }
  | {
      kind: 'dhub-squad';
      name: string;
      platformName?: string;
      unitName?: string;
      squadLead?: string;
      tools?: string[];
      capacity: number;
      currentCapacity: number;
      utilizationPct: number;
    }
  | {
      kind: 'dhub-resource';
      cwid: string;
      name: string;
      status: string;
      allocationPercentage: number;
      platformName?: string;
      assignedSquads?: { squadName: string; percentage: number }[];
      primarySkills?: string[];
    }
  | { kind: 'dhub-transfer'; id: string; status: string; priority: string; targetSquadName: string }
  | { kind: 'concept'; topic: string; body: string }
  | { kind: 'savings'; title: string; monthlySavings: number; confidence: number };
