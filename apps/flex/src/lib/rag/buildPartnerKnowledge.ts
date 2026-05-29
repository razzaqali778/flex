import {
  dhubConsumedDatasets,
  dhubDashboardStats,
  dhubDomainSummary,
  dhubResources,
  dhubSquads,
  dhubTransferRequests,
  eztracBudgets,
  eztracCalendar2026,
  eztracConsumedDatasets,
  eztracDomainSummary,
  eztracEffortSpend,
  eztracForecasts,
  eztracInitiatives,
} from '../../data/partners';
import type { KnowledgeChunk } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function buildPartnerKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    {
      id: 'eztrac-domain',
      category: 'eztrac',
      title: 'EzTrac platform overview',
      relevanceRoute: '/integrations',
      content: eztracDomainSummary,
      keywords: [
        'eztrac',
        'finance',
        'forecast',
        'initiative',
        'budget',
        'vip',
        'costing',
        'effort',
        'portfolio',
        'bayer',
      ],
      facts: { kind: 'partner-domain', app: 'eztrac', summary: eztracDomainSummary },
    },
    {
      id: 'dhub-domain',
      category: 'dhub-rpt',
      title: 'dhub-rpt platform overview',
      relevanceRoute: '/integrations',
      content: dhubDomainSummary,
      keywords: [
        'dhub',
        'rpt',
        'resource',
        'planning',
        'squad',
        'capacity',
        'allocation',
        'transfer',
        'digital hub',
      ],
      facts: { kind: 'partner-domain', app: 'dhub-rpt', summary: dhubDomainSummary },
    },
  ];

  eztracInitiatives.forEach((i) => {
    chunks.push({
      id: `eztrac-init-${i.initiativeId}`,
      category: 'eztrac',
      title: i.initiativeName,
      relevanceRoute: '/integrations',
      content: `EzTrac initiative ${i.initiativeName} (${i.initiativeId}): status ${i.status}, finance ${i.financeCodeType} ${i.financeCodeValue}, community ${i.community}${i.parent ? `, parent ${i.parent}` : ''}.`,
      keywords: [
        ...tokenize(i.initiativeName),
        i.initiativeId.toLowerCase(),
        'initiative',
        'eztrac',
        'vip',
        i.community.toLowerCase(),
      ],
      facts: {
        kind: 'eztrac-initiative',
        initiativeId: i.initiativeId,
        name: i.initiativeName,
        status: i.status,
      },
    });
  });

  eztracBudgets.forEach((b) => {
    const init = eztracInitiatives.find((i) => i.initiativeId === b.initiativeId);
    chunks.push({
      id: `eztrac-budget-${b.budgetId}`,
      category: 'eztrac',
      title: `Budget FY${b.fiscalYear} — ${init?.initiativeName ?? b.initiativeId}`,
      relevanceRoute: '/integrations',
      content: `EzTrac budget ${b.budgetId} for ${init?.initiativeName ?? b.initiativeId}: FY${b.fiscalYear} amount $${(b.amount / 1000).toFixed(0)}K${b.splits ? ` with ${b.splits.length} community splits` : ''}.`,
      keywords: ['budget', 'fiscal', 'eztrac', 'forecast', 'spend', String(b.fiscalYear)],
      facts: {
        kind: 'eztrac-budget',
        initiativeId: b.initiativeId,
        fiscalYear: b.fiscalYear,
        amount: b.amount,
      },
    });
  });

  eztracForecasts.forEach((f, idx) => {
    chunks.push({
      id: `eztrac-forecast-${f.effortId}-${idx}`,
      category: 'eztrac',
      title: `Forecast team ${f.teamId}`,
      relevanceRoute: '/cloud',
      content: `EzTrac forecast: team ${f.teamId}, timeframe ${f.timeFrameId}, ${f.peopleNumber} FTE at ${f.costGroupId}/${f.rateId}, estimated $${(f.estimatedCost / 1000).toFixed(0)}K.`,
      keywords: ['forecast', 'effort', 'team', f.teamId.toLowerCase(), 'eztrac', 'fte'],
      facts: {
        kind: 'eztrac-forecast',
        teamId: f.teamId,
        estimatedCost: f.estimatedCost,
        peopleNumber: f.peopleNumber,
      },
    });
  });

  eztracEffortSpend.forEach((s) => {
    chunks.push({
      id: `eztrac-spend-${s.initiativeId}-${s.timeFrameId}`,
      category: 'eztrac',
      title: `Spend ${s.initiativeName}`,
      relevanceRoute: '/cloud',
      content: `EzTrac spending: ${s.initiativeName} via ${s.teamName} (${s.teamId}), timeframe ${s.timeFrameId}: direct $${(s.directExpenditure / 1000).toFixed(1)}K, total $${(s.totalExpenditure / 1000).toFixed(1)}K.`,
      keywords: [
        'spend',
        'expenditure',
        'effort',
        ...tokenize(s.initiativeName),
        s.teamId.toLowerCase(),
        'eztrac',
        'reporting',
      ],
      facts: {
        kind: 'eztrac-spend',
        initiativeId: s.initiativeId,
        directExpenditure: s.directExpenditure,
        totalExpenditure: s.totalExpenditure,
      },
    });
  });

  eztracCalendar2026.forEach((c) => {
    chunks.push({
      id: `eztrac-cal-${c.timeframeId}`,
      category: 'eztrac',
      title: `Calendar ${c.calendar} ${c.month} ${c.year}`,
      content: `EzTrac calendar ${c.calendar}: ${c.month} ${c.year}, timeframe ${c.timeframeId}, ${c.workingDays} working days, ${c.employeeHrs} employee hrs, ${c.contractorHrs} contractor hrs (from EZTRAC_2026_SETUP.csv).`,
      keywords: ['calendar', 'workday', 'timeframe', c.month.toLowerCase(), 'hours', 'eztrac'],
      facts: {
        kind: 'eztrac-calendar',
        month: c.month,
        timeframeId: c.timeframeId,
        employeeHrs: c.employeeHrs,
      },
    });
  });

  eztracConsumedDatasets.forEach((d) => {
    chunks.push({
      id: `eztrac-consume-${d.name}`,
      category: 'eztrac',
      title: `EzTrac consumes ${d.name}`,
      relevanceRoute: '/exchange',
      content: `EzTrac consumes Flex dataset "${d.name}" (${d.recordCount.toLocaleString()} records) for ${d.purpose}.`,
      keywords: [...tokenize(d.name), 'eztrac', 'consume', 'dataset', 'flex', 'exchange'],
      facts: { kind: 'partner-dataset', app: 'eztrac', name: d.name, recordCount: d.recordCount },
    });
  });

  chunks.push({
    id: 'dhub-dashboard',
    category: 'dhub-rpt',
    title: 'dhub-rpt capacity dashboard',
    relevanceRoute: '/resources',
    content: `dhub-rpt org stats: ${dhubDashboardStats.totalResources} resources, ${dhubDashboardStats.totalSquads} squads, capacity ${dhubDashboardStats.usedCapacity}/${dhubDashboardStats.totalCapacity} (${dhubDashboardStats.capacityUtilizationPct}% utilization), ${dhubDashboardStats.overAllocatedSquads} over-allocated squads, ${dhubDashboardStats.pendingTransfers} pending transfers. Top skills: ${dhubDashboardStats.topSkills.map((s) => `${s.skill} (${s.count})`).join(', ')}.`,
    keywords: [
      'capacity',
      'utilization',
      'squad',
      'resource',
      'dhub',
      'dashboard',
      'skills',
      'over-allocated',
    ],
    facts: {
      kind: 'dhub-dashboard',
      totalResources: dhubDashboardStats.totalResources,
      capacityUtilizationPct: dhubDashboardStats.capacityUtilizationPct,
      pendingTransfers: dhubDashboardStats.pendingTransfers,
    },
  });

  dhubSquads.forEach((s) => {
    const util = Math.round((s.currentCapacity / s.capacity) * 100);
    chunks.push({
      id: `dhub-squad-${s.id}`,
      category: 'dhub-rpt',
      title: `Squad ${s.name}`,
      relevanceRoute: '/resources',
      content: `dhub-rpt squad "${s.name}" on ${s.platformName} / ${s.unitName}: lead ${s.squadLead}, capacity ${s.currentCapacity}/${s.capacity} (${util}%), status ${s.status}. Tools: ${s.toolsAndTechnologies.join(', ')}.`,
      keywords: [
        ...tokenize(s.name),
        'squad',
        'capacity',
        'dhub',
        'planning',
        s.unitName.toLowerCase(),
        util > 100 ? 'over-allocated' : 'healthy',
      ],
      facts: {
        kind: 'dhub-squad',
        name: s.name,
        platformName: s.platformName,
        unitName: s.unitName,
        squadLead: s.squadLead,
        tools: s.toolsAndTechnologies,
        capacity: s.capacity,
        currentCapacity: s.currentCapacity,
        utilizationPct: util,
      },
    });
  });

  dhubResources.forEach((r) => {
    const squads = r.assignedSquads.map((s) => `${s.squadName} (${s.percentage}%)`).join('; ');
    chunks.push({
      id: `dhub-res-${r.cwid}`,
      category: 'dhub-rpt',
      title: r.name,
      relevanceRoute: '/resources',
      content: `dhub-rpt resource ${r.name} (${r.cwid}): ${r.designation}, ${r.experienceLevel}, ${r.location}, status ${r.status}, ${r.allocationPercentage}% allocated. Squads: ${squads}. Skills: ${r.primarySkills.join(', ')}.`,
      keywords: [
        ...tokenize(r.name),
        r.cwid.toLowerCase(),
        ...r.primarySkills.map((s) => s.toLowerCase()),
        'resource',
        'allocation',
        r.status,
        'dhub',
      ],
      facts: {
        kind: 'dhub-resource',
        cwid: r.cwid,
        name: r.name,
        status: r.status,
        allocationPercentage: r.allocationPercentage,
        platformName: r.platformName,
        assignedSquads: r.assignedSquads,
        primarySkills: r.primarySkills,
      },
    });
  });

  dhubTransferRequests.forEach((t) => {
    chunks.push({
      id: `dhub-transfer-${t.id}`,
      category: 'dhub-rpt',
      title: `Transfer ${t.resourceName}`,
      relevanceRoute: '/integrations',
      content: `dhub-rpt transfer ${t.id}: ${t.resourceName} from ${t.currentSquadName} → ${t.targetSquadName} at ${t.targetPercentage}%, priority ${t.priority}, status ${t.status}. Reason: ${t.reason}. Start ${t.proposedStartDate}.`,
      keywords: [
        'transfer',
        'squad',
        t.status.toLowerCase(),
        t.priority.toLowerCase(),
        ...tokenize(t.resourceName),
        'dhub',
        'pending',
      ],
      facts: {
        kind: 'dhub-transfer',
        id: t.id,
        status: t.status,
        priority: t.priority,
        targetSquadName: t.targetSquadName,
      },
    });
  });

  dhubConsumedDatasets.forEach((d) => {
    chunks.push({
      id: `dhub-consume-${d.name}`,
      category: 'dhub-rpt',
      title: `dhub-rpt consumes ${d.name}`,
      relevanceRoute: '/exchange',
      content: `dhub-rpt consumes Flex dataset "${d.name}" (${d.recordCount.toLocaleString()} records) for ${d.purpose}.`,
      keywords: [...tokenize(d.name), 'dhub', 'consume', 'dataset', 'flex', 'allocation'],
      facts: { kind: 'partner-dataset', app: 'dhub-rpt', name: d.name, recordCount: d.recordCount },
    });
  });

  return chunks;
}
