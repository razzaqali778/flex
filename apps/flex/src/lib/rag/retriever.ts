import type { KnowledgeChunk, RetrievedChunk } from './types';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'are',
  'what',
  'how',
  'can',
  'you',
  'tell',
  'about',
  'show',
  'give',
  'with',
  'from',
  'that',
  'this',
  'our',
  'any',
  'have',
  'does',
  'did',
  'was',
  'were',
]);

const QUERY_ALIASES: Record<string, string[]> = {
  sqaue: ['squad', 'squads'],
  squade: ['squad', 'squads'],
  rtp: ['dhub', 'rpt', 'dhub-rpt', 'resource', 'planning'],
  finops: ['flex', 'kpi', 'cloud', 'financial'],
  eztrac: ['eztrac', 'initiative', 'budget', 'forecast'],
};

function queryTokens(query: string): string[] {
  const base = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const expanded = new Set(base);
  for (const token of base) {
    const aliases = QUERY_ALIASES[token];
    if (aliases) aliases.forEach((a) => expanded.add(a));
  }
  return [...expanded];
}

function scoreChunk(chunk: KnowledgeChunk, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const haystack = `${chunk.title} ${chunk.content} ${chunk.keywords.join(' ')}`.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score += 3;
    if (chunk.keywords.some((k) => k.includes(token) || token.includes(k))) score += 2;
    if (chunk.title.toLowerCase().includes(token)) score += 4;
    if (chunk.category.includes(token)) score += 1;
  }

  return score;
}

export function retrieveChunks(
  chunks: KnowledgeChunk[],
  query: string,
  limit = 5
): RetrievedChunk[] {
  const tokens = queryTokens(query);

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, tokens) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function retrieveOrFallback(
  chunks: KnowledgeChunk[],
  query: string,
  limit = 5
): RetrievedChunk[] {
  const results = retrieveChunks(chunks, query, limit);
  if (results.length > 0) return results;

  return chunks
    .map((chunk) => ({ ...chunk, score: 1 }))
    .slice(0, Math.min(3, limit));
}
