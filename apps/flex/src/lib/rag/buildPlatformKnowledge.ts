import {
  dhubRptArchitecture,
  ecosystemFlow,
  eztracArchitecture,
  finOpsConcept,
  flexPlatformOverview,
  flexProblemsSolved,
  flexRoutes,
  flexTechStack,
  squadOrgModel,
} from '../../data/platformKnowledge';
import type { KnowledgeChunk } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

const conceptChunks: { id: string; doc: typeof finOpsConcept; category: KnowledgeChunk['category']; route?: string }[] = [
  { id: 'concept-finops', doc: finOpsConcept, category: 'platform', route: '/' },
  { id: 'concept-flex', doc: flexPlatformOverview, category: 'flex', route: '/' },
  { id: 'concept-flex-value', doc: flexProblemsSolved, category: 'flex', route: '/' },
  { id: 'concept-flex-stack', doc: flexTechStack, category: 'flex', route: '/assistant' },
  { id: 'concept-flex-routes', doc: flexRoutes, category: 'flex', route: '/' },
  { id: 'concept-eztrac-arch', doc: eztracArchitecture, category: 'eztrac', route: '/integrations' },
  { id: 'concept-dhub-arch', doc: dhubRptArchitecture, category: 'dhub-rpt', route: '/integrations' },
  { id: 'concept-ecosystem', doc: ecosystemFlow, category: 'platform', route: '/integrations' },
  { id: 'concept-squad-org', doc: squadOrgModel, category: 'dhub-rpt', route: '/resources' },
];

export function buildPlatformKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = conceptChunks.map(({ id, doc, category, route }) => ({
    id,
    category,
    title: doc.title,
    relevanceRoute: route,
    content: doc.body,
    keywords: [...doc.keywords, ...tokenize(doc.title), ...tokenize(doc.body)],
    facts: { kind: 'concept', topic: doc.title, body: doc.body },
  }));

  chunks.push({
    id: 'eztrac-tools-summary',
    category: 'eztrac',
    title: 'EzTrac service modules',
    relevanceRoute: '/integrations',
    content: eztracArchitecture.body,
    keywords: eztracArchitecture.keywords,
    facts: { kind: 'concept', topic: 'EzTrac tools', body: eztracArchitecture.body },
  });

  return chunks;
}
