/**
 * EzTrac mock data — shaped from Desktop/EZTrac repos:
 * eztrac-core-services, eztrac-costing-services, eztrac-vip, eztrac-reporting-services
 * Calendar rows derived from eztrac-notes/calendar-setup/resources/EZTRAC_2026_SETUP.csv
 */

export interface EzTracCalendarMonth {
  calendar: string;
  year: number;
  month: string;
  timeframeId: number;
  workingDays: number;
  employeeHrs: number;
  contractorHrs: number;
}

export interface EzTracInitiative {
  initiativeId: string;
  initiativeName: string;
  status: string;
  parent?: string;
  financeCodeType: string;
  financeCodeValue: string;
  community: string;
}

export interface EzTracBudget {
  budgetId: number;
  initiativeId: string;
  fiscalYear: number;
  amount: number;
  splits?: { splitField: string; splitValue: string; splitAmount: number }[];
}

export interface EzTracForecast {
  effortId: number;
  teamId: string;
  timeFrameId: number;
  peopleNumber: number;
  costGroupId: string;
  rateId: string;
  estimatedCost: number;
}

export interface EzTracEffortSpend {
  initiativeId: string;
  initiativeName: string;
  timeFrameId: number;
  teamId: string;
  teamName: string;
  directExpenditure: number;
  totalExpenditure: number;
}

/** US-Variable calendar — sample from EZTRAC_2026_SETUP.csv */
export const eztracCalendar2026: EzTracCalendarMonth[] = [
  { calendar: 'US-Variable', year: 2026, month: 'Jan', timeframeId: 42601, workingDays: 20, employeeHrs: 176, contractorHrs: 160 },
  { calendar: 'US-Variable', year: 2026, month: 'Feb', timeframeId: 42602, workingDays: 20, employeeHrs: 160, contractorHrs: 160 },
  { calendar: 'US-Variable', year: 2026, month: 'Mar', timeframeId: 42603, workingDays: 21, employeeHrs: 168, contractorHrs: 160 },
  { calendar: 'US-Variable', year: 2026, month: 'Apr', timeframeId: 42604, workingDays: 22, employeeHrs: 176, contractorHrs: 160 },
  { calendar: 'US-Variable', year: 2026, month: 'May', timeframeId: 42605, workingDays: 21, employeeHrs: 168, contractorHrs: 160 },
  { calendar: 'US-Variable', year: 2026, month: 'Jun', timeframeId: 42606, workingDays: 21, employeeHrs: 168, contractorHrs: 160 },
];

export const eztracInitiatives: EzTracInitiative[] = [
  {
    initiativeId: 'INIT-CLOUD-OPS-2026',
    initiativeName: 'Cloud Operations Modernization',
    status: 'Active',
    financeCodeType: 'WBS',
    financeCodeValue: 'CW-OPS-2026-01',
    community: 'Digital Infrastructure',
  },
  {
    initiativeId: 'INIT-DATA-PLATFORM',
    initiativeName: 'Enterprise Data Platform',
    status: 'Active',
    parent: 'INIT-CLOUD-OPS-2026',
    financeCodeType: 'WBS',
    financeCodeValue: 'CW-DATA-2026-02',
    community: 'Data & Analytics',
  },
  {
    initiativeId: 'INIT-FINOPS-FORECAST',
    initiativeName: 'FinOps Forecasting Enablement',
    status: 'Planning',
    financeCodeType: 'IO',
    financeCodeValue: 'IO-FIN-8842',
    community: 'Finance Technology',
  },
];

export const eztracBudgets: EzTracBudget[] = [
  {
    budgetId: 1001,
    initiativeId: 'INIT-CLOUD-OPS-2026',
    fiscalYear: 2026,
    amount: 2_450_000,
    splits: [
      { splitField: 'COMMUNITY', splitValue: 'Digital Infrastructure', splitAmount: 1_500_000 },
      { splitField: 'COMMUNITY', splitValue: 'Security', splitAmount: 950_000 },
    ],
  },
  {
    budgetId: 1002,
    initiativeId: 'INIT-DATA-PLATFORM',
    fiscalYear: 2026,
    amount: 890_000,
  },
  {
    budgetId: 1003,
    initiativeId: 'INIT-FINOPS-FORECAST',
    fiscalYear: 2026,
    amount: 320_000,
    splits: [{ splitField: 'COMMUNITY', splitValue: 'Finance Technology', splitAmount: 320_000 }],
  },
];

export const eztracForecasts: EzTracForecast[] = [
  {
    effortId: 12001,
    teamId: 'ROD-DEV-TEAM',
    timeFrameId: 42606,
    peopleNumber: 4.5,
    costGroupId: 'PE-PRODUCT-DEVELOPMENT',
    rateId: 'STANDARD',
    estimatedCost: 185_000,
  },
  {
    effortId: 12002,
    teamId: 'FINOPS-ANALYTICS',
    timeFrameId: 42606,
    peopleNumber: 2.0,
    costGroupId: 'PE-FINANCE',
    rateId: 'STANDARD',
    estimatedCost: 92_000,
  },
];

export const eztracEffortSpend: EzTracEffortSpend[] = [
  {
    initiativeId: 'INIT-CLOUD-OPS-2026',
    initiativeName: 'Cloud Operations Modernization',
    timeFrameId: 42605,
    teamId: 'ROD-DEV-TEAM',
    teamName: 'Platform Engineering',
    directExpenditure: 142_500,
    totalExpenditure: 168_200,
  },
  {
    initiativeId: 'INIT-DATA-PLATFORM',
    initiativeName: 'Enterprise Data Platform',
    timeFrameId: 42605,
    teamId: 'DATA-ENG-SQUAD',
    teamName: 'Data Engineering',
    directExpenditure: 78_400,
    totalExpenditure: 95_100,
  },
];

/** Datasets EzTrac consumes from Flex (finance forecasting) */
export const eztracConsumedDatasets = [
  { name: 'cloud_cost_daily', purpose: 'Q3 forecast model refresh', recordCount: 36500 },
  { name: 'finops_kpi_bundle', purpose: 'Executive dashboard sync', recordCount: 24 },
  { name: 'anomaly_summary_export', purpose: 'Risk-adjusted forecast', recordCount: 45 },
  { name: 'forecast_variance', purpose: 'Variance vs budget analysis', recordCount: 180 },
];

export const eztracDomainSummary = `EzTrac is Bayer's portfolio cost-tracking platform with Core (teams, efforts, forecasts), Costing (rates, calendars, cost groups), VIP (initiatives, budgets), and Reporting (spending trees). Flex shares cloud cost and KPI datasets; EzTrac provides initiative budgets, forecasts, and effort spend for finance forecasting.`;
