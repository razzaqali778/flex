import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Monitor, Server, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { PartnerConsumptionPanel } from '../components/PartnerConsumptionPanel';
import { useGovernanceEmbedded } from '../hooks/useGovernanceEmbedded';
import { useFlex } from '../store/FlexContext';

const icons = { eztrac: Monitor, 'dhub-rpt': Server };

/** Partner connections — inbound requests + outbound dataset consumption from Flex. */
export function Integrations() {
  const { refreshFromExternal, pullPartnerData, pendingCount, connectedApps, lastSyncMessage, clearSyncMessage } =
    useFlex();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);
  const location = useLocation();
  const embedded = useGovernanceEmbedded();
  const highlightApp = (location.state as { highlightApp?: string } | null)?.highlightApp;

  useEffect(() => {
    if (highlightApp) window.history.replaceState({}, document.title);
  }, [highlightApp]);

  const handleSync = async (app: 'eztrac' | 'dhub-rpt') => {
    setSyncing(app);
    try {
      await refreshFromExternal(app);
    } finally {
      setSyncing(null);
    }
  };

  const handlePull = async (app: 'eztrac' | 'dhub-rpt') => {
    setPulling(app);
    await new Promise((r) => setTimeout(r, 600));
    pullPartnerData(app);
    setPulling(null);
  };

  return (
    <div className={embedded ? undefined : 'page-shell'}>
      {!embedded && (
        <PageHeader
          title="Partner integrations"
          description="Connect EzTrac & dhub-rpt — refresh after Send to Flex. Approve inbound data in Governance hub."
        />
      )}

      {lastSyncMessage && (
        <div className="alert-banner border-flex-success/30 bg-flex-success/10 text-flex-success">
          <span>{lastSyncMessage}</span>
          <button type="button" onClick={clearSyncMessage} className="text-xs underline shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {pendingCount > 0 && (
        <Link
          to="/govern/exchange"
          className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center p-4 rounded-xl border border-flex-warning/40 bg-flex-warning/10 text-sm hover:bg-flex-warning/15 transition-colors"
        >
          <span>
            <strong>{pendingCount}</strong> inbound request{pendingCount > 1 ? 's' : ''} waiting in Approvals
          </span>
          <ArrowRight className="w-4 h-4 text-flex-warning" />
        </Link>
      )}

      <p className="mb-5 text-xs text-flex-muted">
        After <strong className="text-slate-300">Send to Flex</strong> in a partner app, click{' '}
        <strong className="text-slate-300">Refresh from partner</strong>. The Governance hub badge increases — approve
        or reject there.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {connectedApps.map((app) => {
          const Icon = icons[app.id];
          return (
            <div
              key={app.id}
              className={`glass rounded-2xl p-6 shadow-card ${
                highlightApp === app.id ? 'ring-2 ring-flex-accent/50 border border-flex-accent/30' : ''
              }`}
            >
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="flex gap-4 min-w-0">
                  <div className="p-3 rounded-xl bg-flex-accent2/20">
                    <Icon className="w-8 h-8 text-flex-accent2" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{app.name}</h3>
                    <p className="text-sm text-flex-muted mt-1">{app.description}</p>
                  </div>
                </div>
                <Badge variant="success">{app.status}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-flex-muted">Direction</dt>
                  <dd className="font-medium capitalize">{app.direction}</dd>
                </div>
                <div>
                  <dt className="text-flex-muted">Last sync</dt>
                  <dd className="font-medium text-xs">{new Date(app.lastSync).toLocaleString()}</dd>
                </div>
              </dl>

              <PartnerConsumptionPanel
                partner={app.id}
                onPull={() => handlePull(app.id)}
                pulling={pulling === app.id}
              />

              {highlightApp === app.id && (
                <p className="mt-3 text-xs text-flex-accent">
                  Opened from alignment — send from dhub-rpt workspace or refresh below.
                </p>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href={app.id === 'eztrac' ? 'http://localhost:5174/' : 'http://localhost:5175/'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-flex-border hover:bg-white/5 text-sm font-medium"
                >
                  Open {app.name}
                </a>
                <button
                  type="button"
                  disabled={syncing === app.id}
                  onClick={() => handleSync(app.id)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-flex-accent/15 text-flex-accent border border-flex-accent/30 hover:bg-flex-accent/25 disabled:opacity-50 text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing === app.id ? 'animate-spin' : ''}`} />
                  {syncing === app.id ? 'Syncing…' : 'Refresh from partner'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!embedded && (
        <p className="mt-8 text-xs text-flex-muted text-center">
          Publish datasets →{' '}
          <Link to="/govern/exchange" className="text-flex-accent hover:underline">
            Data Exchange
          </Link>
          {' · '}
          <Link to="/govern/alignment" className="text-flex-accent hover:underline">
            Alignment
          </Link>
        </p>
      )}
    </div>
  );
}
