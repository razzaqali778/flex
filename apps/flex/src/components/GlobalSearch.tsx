import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { chargebackRows } from '../data/chargeback';
import { squadWorkforceRows } from '../data/workforce';
import { buildSearchIndex, searchIndex, SEARCH_PAGES, type SearchResult } from '../lib/globalSearch';
import { filterRoutesByFeaturePlugins, isFeatureRouteEnabled } from '../lib/featurePlugins';
import { isExtensionContext } from '../lib/extensionBridge';
import { useInstalledExtensions } from '../hooks/useInstalledExtensions';
import { useFlex } from '../store/FlexContext';

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  page: 'Page',
  team: 'Team',
  squad: 'Squad',
  dataset: 'Dataset',
  anomaly: 'Anomaly',
  initiative: 'Initiative',
  savings: 'Savings',
  transfer: 'Transfer',
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const flex = useFlex();
  const inExtension = isExtensionContext();
  const { refreshKey } = useInstalledExtensions();

  const enabledPages = useMemo(
    () => filterRoutesByFeaturePlugins(SEARCH_PAGES),
    [refreshKey]
  );

  const index = useMemo(
    () =>
      buildSearchIndex({
        pages: enabledPages,
        chargebackTeams: chargebackRows.map((r) => ({
          team: r.team,
          initiative: r.initiative,
          costCenter: r.costCenter,
        })),
        squads: squadWorkforceRows.map((r) => ({
          squad: r.squad,
          platformLead: r.platformLead,
        })),
        datasets: flex.publishedDatasets.map((d) => ({ name: d.name, status: d.status })),
        anomalies: flex.anomalies.map((a) => ({ id: a.id, title: a.title, service: a.service })),
        savings: flex.savings.map((s) => ({ title: s.title, category: s.category })),
        transfers: flex.transferLog.map((t) => ({ message: t.message, dataset: t.dataset })),
      }),
    [enabledPages, flex.anomalies, flex.publishedDatasets, flex.savings, flex.transferLog]
  );

  const results = useMemo(
    () => searchIndex(index, query).filter((r) => isFeatureRouteEnabled(r.route)),
    [index, query]
  );

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    if (!inExtension) return;

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('flex-open-global-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('flex-open-global-search', onOpen);
    };
  }, [inExtension]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const go = (item: SearchResult) => {
    navigate(item.route);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      e.preventDefault();
      go(results[selected]);
    }
  };

  if (!inExtension || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[105] flex items-start justify-center pt-[10vh] px-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl glass rounded-2xl border border-flex-accent2/40 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-flex-border/50">
          <Search className="w-5 h-5 text-flex-accent2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search teams, squads, datasets, anomalies, pages…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-flex-surface text-flex-muted border border-flex-border">
            ⇧⌘F
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-flex-muted">No matches</li>
          ) : (
            results.map((item, idx) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    idx === selected ? 'bg-flex-accent2/15' : 'hover:bg-flex-accent2/10'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-flex-accent2 w-16 shrink-0">
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{item.label}</span>
                    <span className="block text-xs text-flex-muted truncate">{item.description}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

