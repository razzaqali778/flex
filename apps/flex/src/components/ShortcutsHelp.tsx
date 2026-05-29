import { Keyboard } from 'lucide-react';
import { isExtensionContext } from '../lib/extensionBridge';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Command palette — navigate, AI, actions' },
  { keys: ['⇧', '⌘', 'F'], label: 'Global search — teams, squads, datasets' },
  { keys: ['?'], label: 'Show this shortcuts panel' },
  { keys: ['G', 'D'], label: 'Go to Dashboard' },
  { keys: ['G', 'E'], label: 'Go to Governance · Approvals' },
  { keys: ['G', 'I'], label: 'Go to Governance · Partner apps' },
  { keys: ['G', 'L'], label: 'Go to Governance · Alignment' },
  { keys: ['G', 'A'], label: 'Go to Flex AI' },
  { keys: ['G', 'C'], label: 'Go to Chargeback' },
  { keys: ['G', 'W'], label: 'Go to Workforce' },
  { keys: ['G', 'S'], label: 'Go to Settings' },
  { keys: ['Alt', '⇧', 'D'], label: 'Open dashboard (Chrome extension)' },
  { keys: ['Alt', '⇧', 'E'], label: 'Open Governance hub (Chrome)' },
  { keys: ['Alt', '⇧', 'A'], label: 'Open Flex AI (Chrome)' },
  { keys: ['Alt', '⇧', 'C'], label: 'Open Chargeback (Chrome)' },
  { keys: ['Alt', '⇧', 'W'], label: 'Open Workforce (Chrome)' },
  { keys: ['Esc'], label: 'Close any overlay' },
];

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  const inExtension = isExtensionContext();
  if (!open) return null;

  const items = inExtension
    ? SHORTCUTS
    : SHORTCUTS.filter((s) => !s.label.includes('Chrome'));

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md glass rounded-2xl border border-flex-accent/30 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-flex-border/50">
          <Keyboard className="w-5 h-5 text-flex-accent" />
          <h2 className="font-display font-semibold text-lg">Keyboard shortcuts</h2>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {items.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm border-b border-flex-border/20 last:border-0"
            >
              <span className="text-flex-muted">{s.label}</span>
              <span className="flex gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-flex-surface text-slate-300 border border-flex-border font-mono"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="px-5 py-3 text-[10px] text-flex-muted border-t border-flex-border/40">
          Configure Chrome shortcuts at chrome://extensions/shortcuts
        </p>
      </div>
    </div>
  );
}

