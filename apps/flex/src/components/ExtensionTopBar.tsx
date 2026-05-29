import { ExternalLink, Keyboard, Menu, PanelRight, Search } from 'lucide-react';
import { openFullApp, openSidePanel, isExtensionContext } from '../lib/extensionBridge';
import { useFlex } from '../store/FlexContext';

export function ExtensionTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { pendingCount, kpis } = useFlex();

  if (!isExtensionContext()) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-flex-border/50 bg-flex-bg/90 backdrop-blur-md">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="p-1.5 -ml-0.5 rounded-lg text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10 transition-colors shrink-0 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flex-success opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-flex-success" />
        </span>
        <span className="text-xs text-flex-muted truncate">
          Live · ${(kpis.totalSpend / 1000).toFixed(0)}K spend
          {pendingCount > 0 && (
            <span className="text-flex-warning ml-1">· {pendingCount} pending</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          title="Global search (⇧⌘F)"
          className="p-1.5 rounded-lg text-flex-muted hover:text-flex-accent2 hover:bg-flex-accent2/10 transition-colors"
          onClick={() => window.dispatchEvent(new Event('flex-open-global-search'))}
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Command palette (⌘K)"
          className="p-1.5 rounded-lg text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10 transition-colors"
          onClick={() => window.dispatchEvent(new Event('flex-open-command-palette'))}
        >
          <Keyboard className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Open in new tab"
          className="p-1.5 rounded-lg text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10 transition-colors"
          onClick={() => openFullApp()}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Focus side panel"
          className="p-1.5 rounded-lg text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10 transition-colors hidden sm:flex"
          onClick={() => openSidePanel()}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
