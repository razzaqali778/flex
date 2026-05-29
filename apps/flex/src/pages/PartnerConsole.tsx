import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Radio, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { isFlexReachable, partnerConsume, partnerProduce } from '../lib/flexPartnerClient';
import { PLUGIN_PRESETS, type PluginPreset } from '../lib/pluginPresets';
import type { PluginConsumeResult, PluginProduceResult } from '../plugins/types';

type PartnerId = 'eztrac' | 'dhub-rpt';

function presetMatchesPartner(preset: PluginPreset, partner: PartnerId): boolean {
  if (preset.pluginId === 'flex.partner.eztrac') return partner === 'eztrac';
  if (preset.pluginId === 'flex.partner.dhub-rpt') return partner === 'dhub-rpt';
  return true;
}

export function PartnerConsole() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [partner, setPartner] = useState<PartnerId>('eztrac');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    const ok = await isFlexReachable();
    setConnected(ok);
    return ok;
  }, []);

  useEffect(() => {
    void check();
    const t = setInterval(() => void check(), 5000);
    return () => clearInterval(t);
  }, [check]);

  const getPresets = PLUGIN_PRESETS.filter((p) => p.kind === 'get' && presetMatchesPartner(p, partner));
  const sendPresets = PLUGIN_PRESETS.filter((p) => p.kind === 'send' && presetMatchesPartner(p, partner));

  const runGet = async (preset: PluginPreset) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (!(await check())) {
        setError('Flex is not reachable. Open Flex in another tab first.');
        return;
      }
      const out = await partnerConsume({
        pluginId: preset.pluginId,
        dataset: preset.dataset,
        params:
          preset.dataset === 'consumption_status'
            ? undefined
            : preset.params,
      });
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const runSend = async (preset: PluginPreset) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (!(await check())) {
        setError('Flex is not reachable. Open Flex in another tab first.');
        return;
      }
      if (preset.dataset === 'request_sync' || preset.dataset === 'pull_published') {
        const out = await partnerProduce({
          pluginId: preset.pluginId,
          dataset: preset.dataset,
          records: [{ partner }],
          sourceApp: partner,
        });
        setResult(out);
        return;
      }
      if (preset.dataset === 'inbound_request') {
        const out = await partnerProduce({
          pluginId: partner === 'eztrac' ? 'flex.partner.eztrac' : 'flex.partner.dhub-rpt',
          dataset: 'inbound_request',
          records: [
            {
              fromApp: partner,
              dataset: 'forecast_variance',
              recordCount: 1200,
              purpose: `Inbound refresh from ${partner} via Partner Console`,
            },
          ],
          sourceApp: partner,
        });
        setResult(out);
        return;
      }
      const out = await partnerProduce({
        pluginId: preset.pluginId,
        dataset: preset.dataset,
        records: [{}],
      });
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const successMessage =
    result && typeof result === 'object' && result !== null && 'ok' in result
      ? (result as PluginConsumeResult | PluginProduceResult).ok
        ? 'message' in result
          ? String((result as PluginProduceResult).message)
          : `Loaded ${(result as PluginConsumeResult).meta?.recordCount ?? 0} record(s)`
        : null
      : null;

  return (
    <div className="page-shell max-w-3xl">
      <PageHeader
        title="Partner console"
        description="This simulates EzTrac or dhub-rpt in a separate window — get data from Flex and send data into Flex using plugins."
      />

      <div className="glass rounded-xl p-4 border border-flex-accent/25 mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-flex-accent" />
            Connection to Flex
          </p>
          {connected === true && <Badge variant="success">Connected</Badge>}
          {connected === false && <Badge variant="danger">Not connected</Badge>}
          {connected === null && <Badge variant="neutral">Checking…</Badge>}
        </div>
        <p className="text-xs text-flex-muted">
          1. Open Flex in <strong>another tab</strong>:{' '}
          <a href="/" target="_blank" rel="noreferrer" className="text-flex-accent underline">
            Dashboard
          </a>{' '}
          (keep it open). 2. Use this tab to call plugin APIs — no console code needed.
        </p>
        <div className="card-actions">
          <button type="button" onClick={() => void check()} className="btn-outline text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry connection
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="btn-outline-accent text-xs">
            Open Flex (new tab)
          </a>
          <Link to="/apps/eztrac" className="btn-outline text-xs">
            EzTrac embed
          </Link>
          <Link to="/apps/dhub-rpt" className="btn-outline text-xs">
            dhub-rpt embed
          </Link>
        </div>
      </div>

      <label className="block text-sm text-flex-muted mb-6">
        Acting as partner
        <select
          value={partner}
          onChange={(e) => setPartner(e.target.value as PartnerId)}
          className="mt-1 block w-full max-w-xs px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
        >
          <option value="eztrac">EzTrac (Finance)</option>
          <option value="dhub-rpt">dhub-rpt (Planning)</option>
        </select>
      </label>

      <section className="mb-8">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <ArrowDownToLine className="w-4 h-4 text-flex-accent2" />
          Get data from Flex (consume)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {getPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={busy}
              onClick={() => void runGet(preset)}
              className="text-left p-3 rounded-xl glass border border-flex-border/40 hover:border-flex-accent2/40 text-sm disabled:opacity-50"
            >
              <p className="font-medium">{preset.label}</p>
              <p className="text-xs text-flex-muted mt-1">{preset.description}</p>
              <p className="text-[10px] font-mono text-flex-muted mt-2">{preset.pluginId}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <ArrowUpFromLine className="w-4 h-4 text-flex-warning" />
          Send data to Flex (produce)
        </h2>
        <div className="space-y-2">
          {sendPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={busy}
              onClick={() => void runSend(preset)}
              className="w-full text-left p-3 rounded-xl glass border border-flex-warning/30 hover:bg-flex-warning/5 text-sm disabled:opacity-50"
            >
              <p className="font-medium">{preset.label}</p>
              <p className="text-xs text-flex-muted mt-1">{preset.description}</p>
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runSend({
                id: 'send-inbound',
                kind: 'send',
                label: 'Send inbound request',
                description: '',
                pluginId: partner === 'eztrac' ? 'flex.partner.eztrac' : 'flex.partner.dhub-rpt',
                dataset: 'inbound_request',
              })
            }
            className="w-full text-left p-3 rounded-xl glass border border-flex-warning/30 text-sm disabled:opacity-50"
          >
            <p className="font-medium">Send governed inbound request</p>
            <p className="text-xs text-flex-muted mt-1">
              Creates pending approval in Flex Governance through the selected partner plugin
            </p>
          </button>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-flex-danger/40 bg-flex-danger/10 text-sm text-flex-danger mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-flex-success/40 bg-flex-success/10 text-sm text-flex-success mb-4">
          {successMessage}
          <Link to="/govern/exchange" target="_blank" rel="noreferrer" className="block mt-2 underline">
            Open Approvals in Flex
          </Link>
        </div>
      )}

      {result !== null && (
        <div className="glass rounded-xl p-4 border border-flex-border/40">
          <p className="text-xs font-semibold uppercase text-flex-muted mb-2">API response</p>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-xs text-flex-muted mt-8">
        Manage feature plugins in{' '}
        <Link to="/plugins" className="text-flex-accent underline">
          Extensions
        </Link>
        . Production partner apps: <Link to="/apps/eztrac" className="text-flex-accent underline">EzTrac</Link>
        {' · '}
        <Link to="/apps/dhub-rpt" className="text-flex-accent underline">dhub-rpt</Link>
        {' '}
        (<code>flex-plugin-sdk</code>, plugins only).
      </p>
    </div>
  );
}
