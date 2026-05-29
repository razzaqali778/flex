import {
  Check,
  Eraser,
  MoreHorizontal,
  Pencil,
  Pin,
  Printer,
  RefreshCw,
  Files,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatSession } from '../../types/chat';

interface ChatMoreMenuProps {
  session: ChatSession | null;
  isProcessing: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onClear: () => void;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
}

export function ChatMoreMenu({
  session,
  isProcessing,
  canRegenerate,
  onRegenerate,
  onClear,
  onRename,
  onDuplicate,
  onTogglePin,
}: ChatMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(session?.title ?? '');
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    setTitle(session?.title ?? '');
  }, [session?.title]);

  if (!session || session.messages.length === 0) return null;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const items = [
    {
      id: 'regenerate',
      label: 'Regenerate last answer',
      icon: RefreshCw,
      disabled: !canRegenerate || isProcessing,
      onClick: () => {
        onRegenerate();
        setOpen(false);
        flash('Regenerating…');
      },
    },
    {
      id: 'clear',
      label: 'Clear conversation',
      icon: Eraser,
      onClick: () => {
        if (window.confirm('Clear all messages in this chat?')) {
          onClear();
          setOpen(false);
          flash('Conversation cleared');
        }
      },
    },
    {
      id: 'rename',
      label: 'Rename chat',
      icon: Pencil,
      onClick: () => {
        setRenaming(true);
        setOpen(false);
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate chat',
      icon: Files,
      onClick: () => {
        onDuplicate();
        setOpen(false);
        flash('Chat duplicated');
      },
    },
    {
      id: 'pin',
      label: session.pinned ? 'Unpin chat' : 'Pin chat',
      icon: Pin,
      onClick: () => {
        onTogglePin();
        setOpen(false);
        flash(session.pinned ? 'Unpinned' : 'Pinned');
      },
    },
    {
      id: 'print',
      label: 'Print conversation',
      icon: Printer,
      onClick: () => {
        window.print();
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative shrink-0" ref={ref}>
      {toast && (
        <span className="absolute right-0 -top-6 text-[10px] text-flex-success flex items-center gap-1 whitespace-nowrap">
          <Check className="w-3 h-3" />
          {toast}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10 transition-colors"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-52 py-1 rounded-xl glass border border-flex-border/60 shadow-card animate-chat-fade-in">
          {items.map(({ id, label, icon: Icon, disabled, onClick }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={onClick}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-flex-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-flex-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm rounded-2xl glass border border-flex-border/60 p-4 shadow-card">
            <h3 className="font-display font-semibold text-sm mb-3">Rename chat</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-flex-surface/60 border border-flex-border/50 text-sm text-slate-100 focus:outline-none focus:border-flex-accent/40"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRename(title);
                  setRenaming(false);
                }
                if (e.key === 'Escape') setRenaming(false);
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRenaming(false)}
                className="px-3 py-1.5 text-xs text-flex-muted hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRename(title);
                  setRenaming(false);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-flex-accent/20 text-flex-accent"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
