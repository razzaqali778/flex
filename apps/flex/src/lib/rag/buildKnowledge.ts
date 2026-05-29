import {
  anomalies,
  cloudUsageHistory,
  connectedApps,
  forecastData,
  initialKpis,
  resourceAllocations,
  serviceBreakdown,
} from '../../data/mockData';
import type {
  Anomaly,
  DataRequest,
  KpiSnapshot,
  PublishedDataset,
  TransferLogEntry,
} from '../../types';
import type { KnowledgeChunk } from './types';
import { buildPartnerKnowledgeChunks } from './buildPartnerKnowledge';
import { buildInsightKnowledgeChunks } from './buildInsightKnowledge';
import { buildPlatformKnowledgeChunks } from './buildPlatformKnowledge';

interface FlexKnowledgeInput {
  kpis: KpiSnapshot;
  dataRequests: DataRequest[];
  publishedDatasets: PublishedDataset[];
  anomalies: Anomaly[];
  transferLog: TransferLogEntry[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function buildKnowledgeBase(input: FlexKnowledgeInput): KnowledgeChunk[] {
  const { kpis, dataRequests, publishedDatasets, anomalies: liveAnomalies, transferLog } =
    input;

  const chunks: KnowledgeChunk[] = [
    {
      id: 'kpi-summary',
      category: 'kpis',
      title: 'Executive KPIs',
      relevanceRoute: '/',
      content: `Total cloud spend is $${(kpis.totalSpend / 1000).toFixed(1)}K (${kpis.spendChange > 0 ? '+' : ''}${kpis.spendChange}% vs prior period). Utilization is ${kpis.utilization}% across ${kpis.activeResources.toLocaleString()} active resources. There are ${kpis.openAnomalies} open anomalies and ${kpis.pendingApprovals} pending data-exchange approvals.`,
      keywords: ['spend', 'kpi', 'utilization', 'budget', 'cost', 'total', 'executive', 'dashboard'],
      facts: {
        kind: 'kpi',
        totalSpend: kpis.totalSpend,
        spendChange: kpis.spendChange,
        utilization: kpis.utilization,
        activeResources: kpis.activeResources,
        openAnomalies: kpis.openAnomalies,
        pendingApprovals: kpis.pendingApprovals,
      },
    },
    {
      id: 'kpi-baseline',
      category: 'kpis',
      title: 'KPI baseline (seed)',
      content: `Platform baseline from FinOps seed: spend $${(initialKpis.totalSpend / 1000).toFixed(1)}K, utilization ${initialKpis.utilization}%, ${initialKpis.activeResources} resources tracked.`,
      keywords: ['baseline', 'seed', 'initial'],
    },
  ];

  liveAnomalies.forEach((a) => {
    chunks.push({
      id: `anomaly-${a.id}`,
      category: 'anomalies',
      title: a.title,
      relevanceRoute: '/anomalies',
      content: `${a.severity.toUpperCase()} anomaly on ${a.service}: ${a.title}. Status: ${a.status}. Impact: ${a.impact}. Detected ${new Date(a.detectedAt).toLocaleString()}. Delta: ${a.deltaPercent}%.`,
      keywords: [
        ...tokenize(a.title),
        a.service.toLowerCase(),
        a.severity,
        a.status,
        'anomaly',
        'alert',
        'incident',
      ],
      facts: {
        kind: 'anomaly',
        severity: a.severity,
        service: a.service,
        title: a.title,
        status: a.status,
        impact: a.impact,
        detectedAt: a.detectedAt,
        deltaPercent: a.deltaPercent,
      },
    });
  });

  anomalies
    .filter((a) => !liveAnomalies.some((l) => l.id === a.id))
    .forEach((a) => {
      chunks.push({
        id: `anomaly-archive-${a.id}`,
        category: 'anomalies',
        title: `${a.title} (archive)`,
        content: `Historical anomaly record: ${a.title}, ${a.severity}, ${a.status}.`,
        keywords: tokenize(a.title),
      });
    });

  dataRequests.forEach((r) => {
    chunks.push({
      id: `request-${r.id}`,
      category: 'exchange',
      title: `Data request: ${r.dataset}`,
      relevanceRoute: '/exchange',
      content: `${r.fromApp} requested dataset "${r.dataset}" (${r.recordCount.toLocaleString()} records) for: ${r.purpose}. Status: ${r.status}. Requested ${new Date(r.requestedAt).toLocaleDateString()}.`,
      keywords: [
        ...tokenize(r.dataset),
        r.fromApp,
        r.status,
        'request',
        'approval',
        'exchange',
        'pending',
        'eztrac',
        'dhub',
      ],
      facts: {
        kind: 'request',
        fromApp: r.fromApp,
        dataset: r.dataset,
        status: r.status,
        recordCount: r.recordCount,
        purpose: r.purpose,
        requestedAt: r.requestedAt,
      },
    });
  });

  publishedDatasets.forEach((d) => {
    chunks.push({
      id: `dataset-${d.id}`,
      category: 'datasets',
      title: d.name,
      relevanceRoute: '/exchange',
      content: `Published dataset "${d.name}": ${d.description}. Schema: ${d.schema.join(', ')}. Status: ${d.status}. Consumers: ${d.consumers.length ? d.consumers.join(', ') : 'none yet'}. Records: ${d.recordCount.toLocaleString()}. Last published: ${d.lastPublished ? new Date(d.lastPublished).toLocaleString() : 'not yet'}.`,
      keywords: [
        ...tokenize(d.name),
        ...tokenize(d.description),
        'dataset',
        'publish',
        'schema',
        d.status,
        'consumer',
      ],
      facts: {
        kind: 'dataset',
        name: d.name,
        description: d.description,
        status: d.status,
        consumers: d.consumers,
        recordCount: d.recordCount,
      },
    });
  });

  const latestUsage = cloudUsageHistory[cloudUsageHistory.length - 1];
  const usageTotal =
    latestUsage.compute + latestUsage.storage + latestUsage.network + latestUsage.database;
  chunks.push({
    id: 'cloud-latest',
    category: 'cloud',
    title: 'Latest cloud usage mix',
    relevanceRoute: '/cloud',
    content: `Latest period (${latestUsage.date}): compute ${latestUsage.compute}%, storage ${latestUsage.storage}%, network ${latestUsage.network}%, database ${latestUsage.database}% — indexed total ${usageTotal}. Trend shows compute and database as largest drivers.`,
    keywords: ['cloud', 'usage', 'compute', 'storage', 'network', 'database', 'service', 'mix'],
    facts: {
      kind: 'cloud-mix',
      period: latestUsage.date,
      compute: latestUsage.compute,
      storage: latestUsage.storage,
      network: latestUsage.network,
      database: latestUsage.database,
    },
  });

  serviceBreakdown.forEach((s) => {
    chunks.push({
      id: `service-${s.name}`,
      category: 'cloud',
      title: `Service: ${s.name}`,
      relevanceRoute: '/cloud',
      content: `${s.name} accounts for ${s.value}% of cloud spend breakdown.`,
      keywords: [s.name.toLowerCase(), 'breakdown', 'percentage', 'spend'],
      facts: { kind: 'service-share', name: s.name, percent: s.value },
    });
  });

  resourceAllocations.forEach((r) => {
    const utilPct = (r.used / r.allocated) * 100;
    chunks.push({
      id: `resource-${r.id}`,
      category: 'resources',
      title: r.name,
      relevanceRoute: '/resources',
      content: `${r.name} (${r.team}): allocated ${r.allocated} ${r.unit}, used ${r.used} (${utilPct.toFixed(1)}% utilization). Trend: ${r.trend}.`,
      keywords: [
        ...tokenize(r.name),
        r.team.toLowerCase(),
        'resource',
        'allocation',
        'capacity',
        r.trend,
        'utilization',
      ],
      facts: {
        kind: 'resource',
        name: r.name,
        team: r.team,
        allocated: r.allocated,
        used: r.used,
        unit: r.unit,
        trend: r.trend,
        utilizationPct: utilPct,
      },
    });
  });

  connectedApps.forEach((app) => {
    chunks.push({
      id: `integration-${app.id}`,
      category: 'integrations',
      title: app.name,
      relevanceRoute: '/integrations',
      content: `${app.name} is ${app.status} (${app.direction} data flow). ${app.description}. Last sync: ${new Date(app.lastSync).toLocaleString()}.`,
      keywords: [
        app.id,
        app.name.toLowerCase(),
        'integration',
        'sync',
        'partner',
        'eztrac',
        'dhub',
        'connected',
      ],
      facts: {
        kind: 'integration',
        id: app.id,
        name: app.name,
        status: app.status,
        direction: app.direction,
        lastSync: app.lastSync,
      },
    });
  });

  transferLog.slice(0, 12).forEach((t) => {
    chunks.push({
      id: `transfer-${t.id}`,
      category: 'transfers',
      title: `Transfer: ${t.dataset}`,
      relevanceRoute: '/integrations',
      content: `${t.direction} transfer ${t.dataset}: ${t.from} → ${t.to}, ${t.recordCount.toLocaleString()} records, status ${t.status}. ${t.message}`,
      keywords: [
        ...tokenize(t.dataset),
        t.direction,
        t.status,
        'transfer',
        'deliver',
        'sync',
        t.from,
        t.to,
      ],
      facts: {
        kind: 'transfer',
        direction: t.direction,
        dataset: t.dataset,
        from: t.from,
        to: t.to,
        recordCount: t.recordCount,
        status: t.status,
      },
    });
  });

  const lastForecast = forecastData[forecastData.length - 1];
  chunks.push({
    id: 'forecast-outlook',
    category: 'forecast',
    title: 'Spend forecast',
    relevanceRoute: '/cloud',
    content: `Forecast for ${lastForecast.month}: projected $${(lastForecast.forecast / 1000).toFixed(0)}K vs budget $${(lastForecast.budget / 1000).toFixed(0)}K.${lastForecast.actual ? ` Actual was $${(lastForecast.actual / 1000).toFixed(0)}K.` : ''}`,
    keywords: ['forecast', 'budget', 'projection', 'future', 'q3', 'quarter'],
    facts: {
      kind: 'forecast',
      month: lastForecast.month,
      forecast: lastForecast.forecast,
      budget: lastForecast.budget,
      actual: lastForecast.actual,
    },
  });

  return [
    ...chunks,
    ...buildPartnerKnowledgeChunks(),
    ...buildPlatformKnowledgeChunks(),
    ...buildInsightKnowledgeChunks(),
  ];
}
