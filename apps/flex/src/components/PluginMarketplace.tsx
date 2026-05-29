import { useState } from 'react';
import { Check, Download, Package, Play, Power, Trash2 } from 'lucide-react';
import { Badge } from './Badge';
import { ExtensionTryResult } from './ExtensionTryResult';
import { ExtensionsGuide } from './ExtensionsGuide';
import { InstallExtensionPackage } from './InstallExtensionPackage';
import { useInstalledExtensions } from '../hooks/useInstalledExtensions';
import type { FlexPluginHost } from '../plugins/host';
import { tryDatasetForExtension } from '../plugins/marketplace/demoActions';
import type { MarketplaceListing, PluginConsumeResult } from '../plugins/types';

const CATEGORY_LABEL: Record<MarketplaceListing['category'], string> = {
  overview: 'Overview',
  governance: 'Governance',
  cost: 'Cloud & cost',
  organization: 'Organization',
  tools: 'Tools',
  integrations: 'Integrations',
  notifications: 'Notifications',
  export: 'Data export',
  ticketing: 'Ticketing',
  analytics: 'Analytics',
};

export function PluginMarketplace({ host }: { host: FlexPluginHost }) {
  const ext = useInstalledExtensions();
  const [filter, setFilter] = useState<string>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [tryResult, setTryResult] = useState<PluginConsumeResult | null>(null);
  const [tryError, setTryError] = useState<string | null>(null);
  const [tryingId, setTryingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categories = ['all', ...new Set(ext.marketplace.map((m) => m.category))];

  const filtered = ext.marketplace
    .filter((m) => filter === 'all' || m.category === filter)
    .filter(
      (m) =>
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
    );

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const runTry = (pluginId: string) => {
    const dataset = tryDatasetForExtension(pluginId);
    if (!dataset) {
      setTryError('No demo action for this extension');
      return;
    }
    if (ext.stateFor(pluginId) !== 'enabled') {
      setTryError('Install and enable this extension first');
      return;
    }
    setTryingId(pluginId);
    setTryError(null);
    setTryResult(null);
    const out = host.consume({ pluginId, dataset });
    setTryingId(null);
    if ('ok' in out && out.ok) {
      setTryResult(out);
      showMsg('Try it succeeded — see result below');
    } else {
      setTryError('error' in out && out.error ? out.error : 'Could not load data — is it enabled?');
    }
  };

  return (
    <div className="space-y-6">
      <ExtensionsGuide />

      <InstallExtensionPackage onInstalled={() => showMsg('Extension installed from package')} />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search extensions…"
        className="w-full px-4 py-2.5 rounded-lg bg-flex-surface border border-flex-border text-sm"
      />

      <div className="glass rounded-xl p-4 border border-flex-accent/20 text-sm">
        <p className="font-medium flex items-center gap-2">
          <Package className="w-4 h-4 text-flex-accent" />
          Marketplace
        </p>
        <p className="text-flex-muted text-xs mt-2">
          Third-party add-ons install here (PagerDuty, Snowflake, …). Core Flex areas (Dashboard, Chargeback, …) are
          managed under <strong>Feature plugins</strong> — always part of the app, enable or disable only.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-flex-success/10 border border-flex-success/30 text-sm text-flex-success">
          {message}
        </div>
      )}

      {(tryResult || tryError) && (
        <ExtensionTryResult result={tryResult} error={tryError} />
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              filter === cat
                ? 'border-flex-accent/50 bg-flex-accent/15 text-flex-accent'
                : 'border-flex-border/40 text-flex-muted'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABEL[cat as MarketplaceListing['category']] ?? cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((listing) => (
          <MarketplaceCard
            key={listing.id}
            listing={listing}
            state={ext.stateFor(listing.id)}
            trying={tryingId === listing.id}
            onInstall={() => {
              const r = ext.install(listing.id);
              if ('error' in r) showMsg(r.error);
              else showMsg(`Installed ${listing.name} — click Try it`);
            }}
            onUninstall={() => {
              const r = ext.uninstall(listing.id);
              if (!r.ok) showMsg(r.error ?? 'Cannot uninstall');
              else showMsg(`Removed ${listing.name}`);
            }}
            onToggle={(enabled) => {
              ext.setEnabled(listing.id, enabled);
              showMsg(enabled ? `Enabled ${listing.name}` : `Disabled ${listing.name}`);
            }}
            onTry={() => runTry(listing.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MarketplaceCard({
  listing,
  state,
  trying,
  onInstall,
  onUninstall,
  onToggle,
  onTry,
}: {
  listing: MarketplaceListing;
  state: 'not_installed' | 'disabled' | 'enabled';
  trying: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onToggle: (enabled: boolean) => void;
  onTry: () => void;
}) {
  return (
    <article className="glass rounded-xl p-5 border border-flex-border/40 flex flex-col">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          {listing.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sm">{listing.name}</h3>
            <Badge variant="neutral">v{listing.version}</Badge>
            {state === 'enabled' && (
              <Badge variant="success">
                <Check className="w-3 h-3 inline mr-0.5" />
                Enabled
              </Badge>
            )}
            {state === 'disabled' && <Badge variant="warning">Disabled</Badge>}
          </div>
          <p className="text-xs text-flex-muted mt-0.5">{listing.publisher}</p>
        </div>
      </div>

      <p className="text-sm text-slate-300 mt-3 flex-1">{listing.description}</p>

      <ul className="mt-3 space-y-1">
        {listing.permissions.map((perm) => (
          <li key={perm} className="text-xs text-flex-muted flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-flex-muted shrink-0" />
            {perm}
          </li>
        ))}
      </ul>

      <p className="text-xs text-flex-muted mt-3">
        {listing.installs.toLocaleString()} installs · {CATEGORY_LABEL[listing.category]}
      </p>

      {listing.route && listing.route !== '/plugins' && (
        <p className="text-xs text-flex-muted mt-2">
          Contributes: <code className="text-flex-accent">{listing.route}</code>
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {state === 'not_installed' && (
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-flex-accent/20 text-flex-accent border border-flex-accent/40 text-sm font-medium hover:bg-flex-accent/30"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        )}
        {state !== 'not_installed' && (
          <>
            {state === 'enabled' && (
              <button
                type="button"
                disabled={trying}
                onClick={onTry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-flex-success/15 text-flex-success border border-flex-success/40 text-sm font-medium hover:bg-flex-success/25 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {trying ? 'Loading…' : 'Try it'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggle(state !== 'enabled')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-flex-border/50 text-sm hover:bg-flex-surface/40"
            >
              <Power className="w-4 h-4" />
              {state === 'enabled' ? 'Disable' : 'Enable'}
            </button>
            <button
              type="button"
              onClick={onUninstall}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-flex-danger/30 text-flex-danger text-sm hover:bg-flex-danger/10"
            >
              <Trash2 className="w-4 h-4" />
              Uninstall
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function InstalledExtensionsList({ host }: { host: FlexPluginHost }) {
  const ext = useInstalledExtensions();
  const [tryResult, setTryResult] = useState<PluginConsumeResult | null>(null);
  const [tryError, setTryError] = useState<string | null>(null);

  const runTry = (pluginId: string) => {
    const dataset = tryDatasetForExtension(pluginId);
    if (!dataset || !ext.installed.find((i) => i.id === pluginId)?.enabled) {
      setTryError('Enable the extension first');
      return;
    }
    setTryError(null);
    const out = host.consume({ pluginId, dataset });
    if ('ok' in out && out.ok) setTryResult(out);
    else setTryError('error' in out && out.error ? out.error : 'Failed');
  };

  if (!ext.installed.length) {
    return (
      <div className="glass rounded-xl p-8 text-center text-sm text-flex-muted">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No extensions installed yet.</p>
        <p className="mt-1 text-xs">Go to the <strong>Marketplace</strong> tab → Install Snowflake (or any card).</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(tryResult || tryError) && <ExtensionTryResult result={tryResult} error={tryError} />}
      <div className="space-y-3">
        {ext.installed.map((row) => {
          const listing = ext.marketplace.find((m) => m.id === row.id);
          if (!listing) return null;
          const enabled = row.enabled;
          return (
            <div
              key={row.id}
              className="glass rounded-xl p-4 border border-flex-border/40 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <span className="text-2xl">{listing.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{listing.name}</p>
              <p className="text-xs text-flex-muted">
                v{row.version} · installed {new Date(row.installedAt).toLocaleDateString()}
                {row.source === 'package' && ' · from package file'}
                {row.source === 'url' && ' · from URL'}
                {!enabled && ' · disabled'}
              </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {enabled && (
                  <button
                    type="button"
                    onClick={() => runTry(row.id)}
                    className="px-3 py-2 rounded-lg text-xs border border-flex-success/40 text-flex-success"
                  >
                    Try it
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => ext.setEnabled(row.id, !enabled)}
                  className="px-3 py-2 rounded-lg text-xs border border-flex-border/50"
                >
                  {enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => ext.uninstall(row.id)}
                  className="px-3 py-2 rounded-lg text-xs border border-flex-danger/30 text-flex-danger"
                >
                  Uninstall
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
