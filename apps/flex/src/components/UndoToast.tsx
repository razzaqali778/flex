import { Undo2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFlex } from '../store/FlexContext';

export function UndoToast() {
  const { undoEntry, undoLastAction, dismissUndo } = useFlex();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoEntry) {
      setProgress(100);
      return;
    }

    const started = Date.now();
    const duration = undoEntry.expiresAt - started;

    const tick = () => {
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [undoEntry]);

  if (!undoEntry) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] w-[min(420px,calc(100vw-2rem))] animate-chat-slide-up">
      <div className="glass rounded-xl border border-flex-accent/30 shadow-2xl overflow-hidden">
        <div
          className="h-0.5 bg-flex-accent/80 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div className="flex items-center gap-3 px-4 py-3">
          <p className="flex-1 text-sm text-slate-200 truncate">{undoEntry.label}</p>
          <button
            type="button"
            onClick={undoLastAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-flex-accent/15 text-flex-accent border border-flex-accent/30 hover:bg-flex-accent/25 shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={dismissUndo}
            className="p-1.5 rounded-lg text-flex-muted hover:text-slate-200"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
