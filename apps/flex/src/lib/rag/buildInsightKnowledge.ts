import { savingsOpportunities, totalIdentifiedSavings } from '../../data/insights';
import { alignmentRows, alignmentScore } from '../../data/alignment';
import type { KnowledgeChunk } from './types';

export function buildInsightKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    {
      id: 'insights-savings-total',
      category: 'forecast',
      title: 'Total identified savings',
      relevanceRoute: '/optimization',
      content: `Flex identified $${(totalIdentifiedSavings / 1000).toFixed(1)}K per month in infrastructure savings (rightsizing, storage, commitments).`,
      keywords: ['savings', 'cost', 'optimize', 'rightsizing', 'finops'],
    },
    {
      id: 'alignment-score',
      category: 'integrations',
      title: 'Cross-app alignment score',
      relevanceRoute: '/alignment',
      content: `Cross-app alignment between Flex, EzTrac, and dhub-rpt is ${alignmentScore}%. Check Alignment page for drift and conflicts.`,
      keywords: ['alignment', 'variance', 'eztrac', 'dhub', 'drift', 'conflict'],
    },
  ];

  savingsOpportunities.forEach((s) => {
    chunks.push({
      id: `savings-${s.id}`,
      category: 'forecast',
      title: s.title,
      relevanceRoute: '/optimization',
      content: `${s.title}: ${s.action}. Monthly savings $${(s.monthlySavings / 1000).toFixed(1)}K.`,
      keywords: [s.category, 'savings', ...s.title.toLowerCase().split(' ')],
      facts: {
        kind: 'savings',
        title: s.title,
        monthlySavings: s.monthlySavings,
        confidence: s.confidence,
      },
    });
  });

  alignmentRows.forEach((row) => {
    chunks.push({
      id: `align-${row.id}`,
      category: 'integrations',
      title: `Alignment: ${row.domain}`,
      relevanceRoute: '/alignment',
      content: `${row.domain}: ${row.status} (${row.variancePct}% variance). ${row.note}`,
      keywords: ['alignment', row.status, row.domain.toLowerCase(), 'eztrac', 'dhub'],
    });
  });

  return chunks;
}
