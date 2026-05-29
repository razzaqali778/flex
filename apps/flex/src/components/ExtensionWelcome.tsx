import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { isExtensionContext } from '../lib/extensionBridge';

const KEY = 'flex_extension_welcome_v2';

export function ExtensionWelcome() {
  const [visible, setVisible] = useState(() => {
    if (!isExtensionContext()) return false;
    return !localStorage.getItem(KEY);
  });

  if (!visible) return null;

  return (
    <div className="mx-4 mt-4 p-4 rounded-2xl border border-flex-accent/30 bg-flex-accent/5 relative text-sm">
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(KEY, '1');
          setVisible(false);
        }}
        className="absolute top-3 right-3 p-1 text-flex-muted hover:text-slate-200"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <Zap className="w-5 h-5 text-flex-accent shrink-0" />
        <div className="text-flex-muted space-y-1">
          <p className="text-slate-200 font-medium">Flex v2 — shortcuts & new pages</p>
          <p>
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-flex-surface border border-flex-border">⌘K</kbd>{' '}
            command palette ·{' '}
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-flex-surface border border-flex-border">⇧⌘F</kbd>{' '}
            global search ·{' '}
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-flex-surface border border-flex-border">?</kbd>{' '}
            all shortcuts
          </p>
          <p><strong className="text-slate-300">Chargeback</strong> — team showback & tag compliance</p>
          <p><strong className="text-slate-300">Workforce</strong> — squad × infra alignment</p>
          <p><strong className="text-slate-300">Exchange</strong> — impact preview before approve/publish</p>
          <p><strong className="text-slate-300">Settings</strong> — enable meeting mode for guided demos</p>
        </div>
      </div>
    </div>
  );
}
