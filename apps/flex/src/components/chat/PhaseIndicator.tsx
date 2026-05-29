import { Brain, FileSearch, Loader2, Sparkles } from 'lucide-react';
import type { AssistantStatus } from '../../types/chat';
import { PHASE_LABELS } from '../../hooks/useRagChat';

const PHASE_ICONS: Partial<Record<AssistantStatus, typeof Brain>> = {
  thinking: Brain,
  retrieving: FileSearch,
  analyzing: Sparkles,
  composing: Sparkles,
  streaming: Loader2,
};

interface PhaseIndicatorProps {
  status: AssistantStatus;
}

export function PhaseIndicator({ status }: PhaseIndicatorProps) {
  const label = PHASE_LABELS[status];
  if (!label) return null;

  const Icon = PHASE_ICONS[status] ?? Loader2;
  const spin = status === 'streaming' || status === 'retrieving';

  return (
    <div className="flex items-center gap-2.5 py-2 animate-chat-fade-in">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-flex-accent/10 border border-flex-accent/25">
        <Icon
          className={`w-4 h-4 text-flex-accent ${spin ? 'animate-spin-slow' : 'animate-pulse-soft'}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-flex-accent/70 animate-thinking-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
