import { Check, Loader2, Zap } from 'lucide-react';
import type { ChatAction } from '../../lib/chatActions';

interface ActionCardsProps {
  actions: ChatAction[];
  onExecute: (actionId: string) => void;
  disabled?: boolean;
}

export function ActionCards({ actions, onExecute, disabled }: ActionCardsProps) {
  const pending = actions.filter((a) => a.status === 'pending');
  if (pending.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-flex-border/40 space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-flex-muted flex items-center gap-1">
        <Zap className="w-3 h-3" />
        Suggested actions · undo available
      </p>
      {pending.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onExecute(action.id)}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-flex-success/5 border border-flex-success/25 hover:bg-flex-success/10 hover:border-flex-success/40 transition-colors disabled:opacity-50"
        >
          <span className="w-8 h-8 rounded-lg bg-flex-success/15 flex items-center justify-center shrink-0">
            {disabled ? (
              <Loader2 className="w-4 h-4 text-flex-success animate-spin" />
            ) : (
              <Check className="w-4 h-4 text-flex-success" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-100">{action.label}</span>
            <span className="block text-xs text-flex-muted truncate">{action.description}</span>
          </span>
          <span className="text-[10px] font-semibold text-flex-success uppercase shrink-0">Run</span>
        </button>
      ))}
    </div>
  );
}
