import { BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RetrievedChunk } from '../../lib/rag/types';

interface SourceCitationsProps {
  sources: RetrievedChunk[];
  expanded?: boolean;
}

export function SourceCitations({ sources, expanded }: SourceCitationsProps) {
  if (!sources.length) return null;

  return (
    <div
      className={`mt-3 rounded-xl border border-flex-border/50 bg-flex-surface/40 overflow-hidden transition-all duration-500 ${
        expanded ? 'opacity-100 max-h-96' : 'opacity-80 max-h-24'
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-flex-border/40 text-xs text-flex-muted">
        <BookOpen className="w-3.5 h-3.5" />
        <span>
          {sources.length} source{sources.length !== 1 ? 's' : ''} retrieved (RAG)
        </span>
      </div>
      <ul className="divide-y divide-flex-border/30 max-h-40 overflow-y-auto">
        {sources.map((s, i) => (
          <li
            key={s.id}
            className="px-3 py-2 text-xs animate-chat-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-medium text-flex-accent">{s.title}</span>
                <span className="ml-2 text-flex-muted capitalize">({s.category})</span>
                <p className="mt-0.5 text-flex-muted line-clamp-1 text-[11px]">
                  Used for context — not shown verbatim in reply
                </p>
              </div>
              {s.relevanceRoute && (
                <Link
                  to={s.relevanceRoute}
                  className="shrink-0 p-1 rounded hover:bg-flex-accent/10 text-flex-accent"
                  title="Open in app"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
