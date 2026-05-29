import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Zap } from 'lucide-react';
import { searchPaletteItems, type PaletteItem } from '../lib/commandIntent';
import { isExtensionContext } from '../lib/extensionBridge';
import { useFlex } from '../store/FlexContext';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inExtension = isExtensionContext();
  const flex = useFlex();

  const filtered = useMemo(() => searchPaletteItems(query), [query]);

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    if (!inExtension) return;

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('flex-open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('flex-open-command-palette', onOpen);
    };
  }, [inExtension]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const runAction = (item: PaletteItem) => {
    if (item.kind === 'ai' && item.aiQuery) {
      navigate('/assistant', { state: { aiQuery: item.aiQuery } });
      close();
      return;
    }

    if (item.kind === 'action') {
      if (item.actionType === 'approve_first') {
        const pending = flex.dataRequests.find((r) => r.status === 'pending');
        if (pending) {
          navigate('/govern/exchange', { state: { previewRequestId: pending.id } });
        } else {
          navigate('/govern/exchange');
        }
      } else if (item.actionType === 'publish_anomaly_feed') {
        const feed = flex.publishedDatasets.find((d) => d.name === 'anomaly_feed');
        if (feed) flex.publishDataset(feed.id);
        navigate('/govern/exchange');
      } else if (item.actionType === 'resolve_critical') {
        const target =
          flex.anomalies.find((a) => a.status !== 'resolved' && a.severity === 'critical') ??
          flex.anomalies.find((a) => a.status !== 'resolved');
        if (target) flex.resolveAnomaly(target.id);
        navigate('/anomalies');
      }
      close();
      return;
    }

    if (item.route) {
      navigate(item.route);
      close();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      e.preventDefault();
      runAction(filtered[selected]);
    }
  };

  if (!inExtension || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="w-full max-w-lg glass rounded-2xl border border-flex-accent/30 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-flex-border/50">
          <Search className="w-5 h-5 text-flex-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Navigate, ask AI, or run an action…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-flex-surface text-flex-muted border border-flex-border">
            esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-sm text-flex-muted text-center">No matches</li>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === selected;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => runAction(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-flex-accent/15' : 'hover:bg-flex-accent/10'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        item.kind === 'ai'
                          ? 'text-flex-accent2'
                          : item.kind === 'action'
                            ? 'text-flex-success'
                            : 'text-flex-accent'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-flex-muted truncate">{item.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-flex-muted shrink-0">
                      {item.kind === 'ai' ? 'AI' : item.kind === 'action' ? 'Run' : 'Go'}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <p className="px-4 py-2 text-[10px] text-flex-muted border-t border-flex-border/40 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI queries
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> Actions with undo
          </span>
          <span>↑↓ enter</span>
        </p>
      </div>
    </div>
  );
}
