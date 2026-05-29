/** Unified search index across Flex data */

export type SearchResultKind =
  | 'page'
  | 'team'
  | 'squad'
  | 'dataset'
  | 'anomaly'
  | 'initiative'
  | 'savings'
  | 'transfer';

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  label: string;
  description: string;
  route: string;
  keywords: string[];
}

interface SearchInput {
  pages: { label: string; route: string; desc: string }[];
  chargebackTeams: { team: string; initiative: string; costCenter: string }[];
  squads: { squad: string; platformLead: string }[];
  datasets: { name: string; status: string }[];
  anomalies: { id: string; title: string; service: string }[];
  savings: { title: string; category: string }[];
  transfers: { message: string; dataset: string }[];
}

export function buildSearchIndex(input: SearchInput): SearchResult[] {
  const results: SearchResult[] = [];

  input.pages.forEach((p, i) => {
    results.push({
      id: `page-${i}`,
      kind: 'page',
      label: p.label,
      description: p.desc,
      route: p.route,
      keywords: [p.label.toLowerCase(), p.desc.toLowerCase()],
    });
  });

  input.chargebackTeams.forEach((t, i) => {
    results.push({
      id: `team-${i}`,
      kind: 'team',
      label: t.team,
      description: `${t.initiative} · ${t.costCenter}`,
      route: '/chargeback',
      keywords: [t.team, t.initiative, t.costCenter].map((s) => s.toLowerCase()),
    });
  });

  input.squads.forEach((s, i) => {
    results.push({
      id: `squad-${i}`,
      kind: 'squad',
      label: s.squad,
      description: s.platformLead,
      route: '/workforce',
      keywords: [s.squad, s.platformLead].map((x) => x.toLowerCase()),
    });
  });

  input.datasets.forEach((d, i) => {
    results.push({
      id: `ds-${i}`,
      kind: 'dataset',
      label: d.name,
      description: d.status,
      route: '/govern/exchange',
      keywords: [d.name, d.status],
    });
  });

  input.anomalies.forEach((a) => {
    results.push({
      id: `anom-${a.id}`,
      kind: 'anomaly',
      label: a.title,
      description: a.service,
      route: '/anomalies',
      keywords: [a.title, a.service, a.id].map((x) => x.toLowerCase()),
    });
  });

  input.savings.forEach((s, i) => {
    results.push({
      id: `save-${i}`,
      kind: 'savings',
      label: s.title,
      description: s.category,
      route: '/optimization',
      keywords: [s.title, s.category],
    });
  });

  input.transfers.slice(0, 8).forEach((t, i) => {
    results.push({
      id: `tl-${i}`,
      kind: 'transfer',
      label: t.dataset,
      description: t.message,
      route: '/govern/exchange',
      keywords: [t.dataset, t.message].map((x) => x.toLowerCase()),
    });
  });

  return results;
}

export function searchIndex(items: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 12);

  return items
    .map((item) => {
      let score = 0;
      if (item.label.toLowerCase().includes(q)) score += 12;
      if (item.description.toLowerCase().includes(q)) score += 6;
      for (const kw of item.keywords) {
        if (kw.includes(q)) score += 5;
        if (q.split(/\s+/).some((w) => w.length > 2 && kw.includes(w))) score += 3;
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 16)
    .map(({ item }) => item);
}

export { SEARCH_PAGES } from './navStructure';
