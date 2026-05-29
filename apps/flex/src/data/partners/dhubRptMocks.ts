/**
 * dhub-rpt mock data — shaped from Desktop/dhub-rpt:
 * backend models, PUBLIC_API_V1_GUIDE.md, frontend types/api.ts
 */

export interface DhubPlatform {
  id: string;
  name: string;
  platformLead: string;
}

export interface DhubSquad {
  id: string;
  name: string;
  platformName: string;
  unitName: string;
  squadLead: string;
  status: 'active' | 'inactive' | 'archived';
  capacity: number;
  currentCapacity: number;
  toolsAndTechnologies: string[];
}

export interface DhubResource {
  cwid: string;
  name: string;
  email: string;
  platformName: string;
  designation: string;
  experienceLevel: string;
  location: string;
  status: 'available' | 'allocated' | 'shared' | 'inactive';
  allocationPercentage: number;
  primarySkills: string[];
  assignedSquads: { squadName: string; percentage: number }[];
}

export interface DhubTransferRequest {
  id: string;
  resourceName: string;
  resourceCwid: string;
  currentSquadName: string;
  targetSquadName: string;
  targetPercentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  proposedStartDate: string;
}

export interface DhubDashboardStats {
  totalResources: number;
  totalSquads: number;
  totalCapacity: number;
  usedCapacity: number;
  overAllocatedSquads: number;
  capacityUtilizationPct: number;
  pendingTransfers: number;
  topSkills: { skill: string; count: number }[];
}

export const dhubPlatforms: DhubPlatform[] = [
  { id: '663a1e00a1b2c3d4e5f60001', name: 'Digital Hub', platformLead: 'Platform Lead A' },
];

export const dhubSquads: DhubSquad[] = [
  {
    id: '663a2000a1b2c3d4e5f60101',
    name: 'Data Explorer Agent',
    platformName: 'Digital Hub',
    unitName: 'AI Engineering Unit',
    squadLead: 'Alice Johnson',
    status: 'active',
    capacity: 10,
    currentCapacity: 8,
    toolsAndTechnologies: ['Python', 'React', 'AWS', 'TypeScript'],
  },
  {
    id: '663a2000a1b2c3d4e5f60102',
    name: 'FinOps Platform Squad',
    platformName: 'Digital Hub',
    unitName: 'Cloud Platform Unit',
    squadLead: 'Bob Smith',
    status: 'active',
    capacity: 12,
    currentCapacity: 11,
    toolsAndTechnologies: ['Kubernetes', 'Terraform', 'Cost Explorer'],
  },
  {
    id: '663a2000a1b2c3d4e5f60103',
    name: 'Resource Planning Core',
    platformName: 'Digital Hub',
    unitName: 'Operations Unit',
    squadLead: 'Carol Davis',
    status: 'active',
    capacity: 8,
    currentCapacity: 9,
    toolsAndTechnologies: ['Node.js', 'MongoDB', 'React'],
  },
];

export const dhubResources: DhubResource[] = [
  {
    cwid: 'ABCD1234',
    name: 'Atharv Arya',
    email: 'atharv.arya@bayer.com',
    platformName: 'Digital Hub',
    designation: 'AI Engineer II',
    experienceLevel: 'Advanced Beginner',
    location: 'India',
    status: 'allocated',
    allocationPercentage: 100,
    primarySkills: ['React', 'TypeScript', 'Python'],
    assignedSquads: [{ squadName: 'Data Explorer Agent', percentage: 100 }],
  },
  {
    cwid: 'EFGH5678',
    name: 'Jane Platform',
    email: 'jane.platform@bayer.com',
    platformName: 'Digital Hub',
    designation: 'Cloud Architect',
    experienceLevel: 'Proficient',
    location: 'US',
    status: 'allocated',
    allocationPercentage: 100,
    primarySkills: ['AWS', 'Kubernetes', 'Terraform'],
    assignedSquads: [{ squadName: 'FinOps Platform Squad', percentage: 100 }],
  },
  {
    cwid: 'IJKL9012',
    name: 'Sam Planner',
    email: 'sam.planner@bayer.com',
    platformName: 'Digital Hub',
    designation: 'Engineering Manager',
    experienceLevel: 'Expert',
    location: 'Germany',
    status: 'shared',
    allocationPercentage: 100,
    primarySkills: ['Node.js', 'MongoDB', 'Leadership'],
    assignedSquads: [
      { squadName: 'Resource Planning Core', percentage: 60 },
      { squadName: 'FinOps Platform Squad', percentage: 40 },
    ],
  },
];

export const dhubTransferRequests: DhubTransferRequest[] = [
  {
    id: 'tr-2026-001',
    resourceName: 'John Doe',
    resourceCwid: 'MNOP3456',
    currentSquadName: 'Data Explorer Agent',
    targetSquadName: 'FinOps Platform Squad',
    targetPercentage: 50,
    priority: 'High',
    status: 'Pending',
    reason: 'Capacity gap for Q3 FinOps delivery',
    proposedStartDate: '2026-06-01',
  },
  {
    id: 'tr-2026-002',
    resourceName: 'Lisa Cloud',
    resourceCwid: 'QRST7890',
    currentSquadName: 'FinOps Platform Squad',
    targetSquadName: 'Resource Planning Core',
    targetPercentage: 100,
    priority: 'Medium',
    status: 'Approved',
    reason: 'dhub-rpt API integration sprint',
    proposedStartDate: '2026-05-15',
  },
];

export const dhubDashboardStats: DhubDashboardStats = {
  totalResources: 183,
  totalSquads: 35,
  totalCapacity: 120,
  usedCapacity: 95,
  overAllocatedSquads: 2,
  capacityUtilizationPct: 79,
  pendingTransfers: 5,
  topSkills: [
    { skill: 'React', count: 42 },
    { skill: 'Python', count: 38 },
    { skill: 'AWS', count: 31 },
    { skill: 'TypeScript', count: 29 },
  ],
};

/** Datasets dhub-rpt consumes from Flex (resource planning) */
export const dhubConsumedDatasets = [
  { name: 'cloud_cost_daily', purpose: 'Capacity cost correlation', recordCount: 36500 },
  { name: 'allocation_matrix', purpose: 'Capacity planning cycle', recordCount: 420 },
  { name: 'resource_utilization_snapshots', purpose: 'Utilization vs allocation', recordCount: 890 },
  { name: 'capacity_forecast', purpose: 'Squad capacity planning', recordCount: 156 },
];

export const dhubCsvExportColumns = [
  'CWID',
  'Name',
  'Email',
  'Platform',
  'Squad',
  'Designation',
  'Engagged Till',
  'Experience Level',
  'Availability',
  'Location',
  'Primary Skills',
  'Secondary Skills',
  'Interests',
];

export const dhubDomainSummary = `dhub-rpt (DHUB Resource Planning Tool) manages Platform → Unit → Squad → Resource hierarchy for Bayer Digital Hub. It tracks allocation percentages, squad capacity, transfer workflows, and skills. Flex publishes allocation_matrix and utilization data; dhub-rpt provides squad capacity and resource assignments for planning.`;
