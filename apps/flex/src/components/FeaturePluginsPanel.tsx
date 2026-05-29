import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Power } from 'lucide-react';
import { Badge } from './Badge';
import { useInstalledExtensions } from '../hooks/useInstalledExtensions';
import { FEATURE_PLUGIN_LIST } from '../lib/featurePlugins';
import type { FlexPluginHost } from '../plugins/host';
import type { MarketplaceCategory } from '../plugins/types';

const SECTION: Record<MarketplaceCategory, string> = {
  overview: 'Overview',
  governance: 'Governance',
  cost: 'Cloud & cost',
  organization: 'Organization',
  tools: 'Tools',
  integrations: 'Integrations',
  notifications: 'Add-ons',
  export: 'Add-ons',
  ticketing: 'Add-ons',
  analytics: 'Add-ons',
};

export function FeaturePluginsPanel({ host }: { host: FlexPluginHost }) {
  const ext = useInstalledExtensions();
  const [apiMsg, setApiMsg] = useState<string | null>(null);

  const bySection = FEATURE_PLUGIN_LIST.reduce(
    (acc, f) => {
      const key = SECTION[f.category] ?? 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {} as Record<string, typeof FEATURE_PLUGIN_LIST>
  );

  return (
    <div className="space-y-6">
      {apiMsg && (
        <div className="p-3 rounded-lg bg-flex-success/10 border border-flex-success/30 text-xs text-flex-success">
          {apiMsg}
        </div>
      )}

      <div className="glass rounded-xl p-4 border border-flex-accent/20 text-sm">
        <p className="font-medium text-slate-200">Use Flex feature-by-feature</p>
        <p className="text-xs text-flex-muted mt-2">
          Core plugins ship with the Flex app (Backstage model). <strong>Disable</strong> hides the route from nav and
          search. <strong>Open</strong> goes to that screen. APIs use the same plugin id.
        </p>
      </div>

      {Object.entries(bySection).map(([section, items]) => (
        <section key={section}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-flex-muted mb-3">{section}</h3>
          <div className="space-y-2">
            {items.map((feat) => {
              const state = ext.stateFor(feat.id);
              const enabled = state === 'enabled';
              const primaryDataset = host.catalog().find((p) => p.id === feat.id)?.datasets[0]?.name;

              return (
                <div
                  key={feat.id}
                  className="glass rounded-xl p-4 border border-flex-border/40 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <span className="text-2xl shrink-0">{feat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{feat.name}</p>
                      <Badge variant="info">Core</Badge>
                      {enabled ? (
                        <Badge variant="success">On</Badge>
                      ) : (
                        <Badge variant="warning">Off</Badge>
                      )}
                    </div>
                    <p className="text-xs text-flex-muted mt-1">{feat.description}</p>
                    <p className="text-[11px] font-mono text-flex-muted mt-1">{feat.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {feat.route && feat.route !== '/plugins' && enabled && (
                      <Link
                        to={feat.route}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-flex-accent/40 text-flex-accent"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </Link>
                    )}
                    {enabled && primaryDataset && (
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg text-xs border border-flex-border/50 hover:bg-flex-surface/40"
                        onClick={() => {
                          const out = host.consume({ pluginId: feat.id, dataset: primaryDataset });
                          if ('ok' in out && out.ok) {
                            setApiMsg(
                              `${feat.name}: ${out.meta.recordCount} record(s) from ${primaryDataset}`
                            );
                          } else {
                            setApiMsg('error' in out && out.error ? out.error : 'API failed');
                          }
                          setTimeout(() => setApiMsg(null), 4000);
                        }}
                      >
                        Test API
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => ext.setEnabled(feat.id, !enabled)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-flex-border/50"
                    >
                      <Power className="w-3.5 h-3.5" />
                      {enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
