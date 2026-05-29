/**
 * Conceptual + architecture knowledge for Flex AI RAG.
 * Grounded in docs/HLD.md, docs/LLD.md, and partner READMEs.
 */

export const finOpsConcept = {
  title: 'What is FinOps',
  body: `FinOps (Cloud Financial Operations) is the practice of bringing financial accountability to variable cloud spend. Teams collaborate on visibility (who spends what), optimization (rightsizing, waste removal), and forecasting (budget vs actual). Flex is the operational hub for that discipline in this ecosystem — formerly branded FinOps, now Flex.`,
  keywords: ['finops', 'financial', 'operations', 'cloud', 'accountability', 'what is'],
};

export const flexPlatformOverview = {
  title: 'Flex platform overview',
  body: `Flex is a FinOps command center delivered as a React SPA and Chrome MV3 side-panel extension. It surfaces cloud usage, resource allocation, cost anomalies, and governs bidirectional data exchange with EzTrac (finance forecasting) and dhub-rpt (resource planning). Live state uses React Context plus localStorage in the demo; production targets a REST API and cloud cost ingest (CUR, Cost Explorer).`,
  keywords: ['flex', 'platform', 'extension', 'chrome', 'developed', 'architecture', 'solve'],
};

export const flexProblemsSolved = {
  title: 'Problems Flex solves',
  body: `Flex addresses: (1) fragmented cloud spend visibility — one dashboard for KPIs, service mix, and trends; (2) ungoverned data sharing — inbound partner requests require explicit approve/reject before export; (3) disconnected finance vs capacity planning — publishes datasets like cloud_cost_daily and allocation_matrix while consuming EzTrac budgets and dhub-rpt squad capacity; (4) reactive cost surprises — anomaly workflow from open → investigating → resolved with optional export to EzTrac risk models; (5) extension-first access — FinOps insights in the browser via side panel without switching tools.`,
  keywords: ['problem', 'solve', 'why', 'value', 'benefit', 'governance', 'exchange'],
};

export const flexTechStack = {
  title: 'Flex technology stack',
  body: `Flex UI: React 18, TypeScript, Tailwind CSS, Recharts, Lucide, React Router (HashRouter in extension). Extension: Chrome Manifest V3, service worker, side panel API, notifications. Build: Vite, npm workspaces. AI assistant: client-side RAG over knowledge chunks with conversational synthesis — no external LLM in demo.`,
  keywords: ['stack', 'technology', 'react', 'vite', 'typescript', 'implement', 'built'],
};

export const flexRoutes = {
  title: 'Flex application routes',
  body: `Routes: Dashboard (KPIs, trends), Cloud Usage (charts), Resources (allocation table), Anomalies (severity workflow), Data Exchange (approve/reject, publish datasets), Integrations (EzTrac, dhub-rpt sync), Flex AI (/assistant — RAG chat), Settings (governance toggles).`,
  keywords: ['route', 'page', 'navigation', 'dashboard', 'assistant'],
};

export const eztracArchitecture = {
  title: 'EzTrac architecture and tools',
  body: `EzTrac is Bayer's portfolio cost-tracking desktop/web platform. Modules: **eztrac-vip** (initiatives, budgets, finance codes), **eztrac-core-services** (teams, efforts, forecasts, FTE costing), **eztrac-costing-services** (rates, cost groups, calendars from EZTRAC_2026_SETUP.csv), **eztrac-reporting-services** (spending trees, direct/total expenditure). Typical stack: Java/Spring services, enterprise auth, calendar-driven timeframes. Flex consumes initiative budgets and effort spend; EzTrac consumes cloud_cost_daily, finops_kpi_bundle, anomaly_summary_export.`,
  keywords: [
    'eztrac',
    'tools',
    'implement',
    'implementation',
    'architecture',
    'vip',
    'core',
    'costing',
    'reporting',
    'java',
    'spring',
  ],
};

export const dhubRptArchitecture = {
  title: 'dhub-rpt (RTP) architecture',
  body: `dhub-rpt is the DHUB Resource Planning Tool (often called RTP in planning conversations). Hierarchy: **Platform → Unit → Squad → Resource**. Backend models squads, capacity, allocation %, transfer workflows, and skills; frontend React + TypeScript; API documented in PUBLIC_API_V1_GUIDE.md. Stack includes Node.js, MongoDB, React. Squads track toolsAndTechnologies (e.g. Kubernetes, Terraform, Python). Flex publishes allocation_matrix and utilization snapshots; dhub-rpt drives squad transfers and capacity dashboards.`,
  keywords: [
    'dhub',
    'rpt',
    'rtp',
    'resource planning',
    'platform',
    'unit',
    'squad',
    'sqaue',
    'squade',
    'hierarchy',
    'tools',
    'implement',
    'mongodb',
    'node',
  ],
};

export const ecosystemFlow = {
  title: 'Flex + EzTrac + dhub-rpt ecosystem',
  body: `Three-way flow: Flex ingests/normalizes cloud metrics → publishes governed datasets → EzTrac models forecasts/budgets and dhub-rpt plans squads/capacity. Inbound: partners request datasets (pending → approved). Outbound: Flex defines schema + consumers then publish. Example: EzTrac pulls cloud_cost_daily for Q3 forecast; dhub-rpt pulls allocation_matrix for capacity cycle; Flex approves resource_utilization_snapshots from dhub-rpt.`,
  keywords: ['ecosystem', 'integrate', 'flow', 'partner', 'together', 'compare'],
};

export const squadOrgModel = {
  title: 'Squad and platform org model',
  body: `In dhub-rpt, people roll up: Platform (e.g. Digital Hub) → Unit (e.g. Cloud Platform Unit, AI Engineering Unit) → Squad (e.g. FinOps Platform Squad) → Resource (CWID, allocation %). A resource can be split across squads (e.g. 60% Resource Planning Core, 40% FinOps Platform Squad). Squad leads own capacity; over-allocation flags when currentCapacity exceeds capacity. Flex resource allocations (EKS, RDS, Lambda) align to engineering teams that map to these squads in planning cycles.`,
  keywords: [
    'squad',
    'sqaue',
    'squade',
    'team',
    'platform',
    'unit',
    'who works',
    'under which',
    'organization',
    'org',
    'lead',
  ],
};
