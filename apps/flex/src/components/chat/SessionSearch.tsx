import { Pin, Search } from 'lucide-react';

interface SessionSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SessionSearch({ value, onChange }: SessionSearchProps) {
  return (
    <div className="px-3 pb-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-flex-muted" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search chats…"
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-flex-surface/50 border border-flex-border/50 text-slate-200 placeholder:text-flex-muted focus:outline-none focus:border-flex-accent/40"
        />
      </div>
      <p className="flex items-center gap-1 mt-1.5 text-[9px] text-flex-muted px-0.5">
        <Pin className="w-2.5 h-2.5" />
        Pinned chats stay on top
      </p>
    </div>
  );
}
