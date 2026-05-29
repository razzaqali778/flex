export type KnowledgeCategory =
  | 'kpis'
  | 'anomalies'
  | 'exchange'
  | 'datasets'
  | 'cloud'
  | 'resources'
  | 'integrations'
  | 'transfers'
  | 'forecast'
  | 'eztrac'
  | 'dhub-rpt'
  | 'platform'
  | 'flex';

import type { ChunkFacts } from './facts';

export interface KnowledgeChunk {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  keywords: string[];
  relevanceRoute?: string;
  facts?: ChunkFacts;
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

export type RagPhase = 'thinking' | 'retrieving' | 'analyzing' | 'composing';
