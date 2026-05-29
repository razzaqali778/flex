import type { RetrievedChunk } from './types';
import { synthesizeResponse } from './synthesize';

export function generateAnswer(query: string, sources: RetrievedChunk[]): string {
  return synthesizeResponse(query, sources);
}
