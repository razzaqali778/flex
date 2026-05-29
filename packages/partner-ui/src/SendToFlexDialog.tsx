import { useEffect, useMemo, useState } from 'react';
import { Send, X } from 'lucide-react';
import { sendDatasets, type PluginListing } from './types';

export interface SendToFlexDialogProps {
  open: boolean;
  plugin: PluginListing | null;
  dataset: string;
  appName: string;
  partner: 'eztrac' | 'dhub-rpt';
  defaultFlexDataset: string;
  busy?: boolean;
  onClose: () => void;
  onSend: (dataset: string, records: unknown[]) => void;
}

type FormState = Record<string, string | number>;

function defaultForm(
  dataset: string,
  partner: 'eztrac' | 'dhub-rpt',
  defaultFlexDataset: string
): FormState {
  switch (dataset) {
    case 'inbound_request':
      return {
        dataset: defaultFlexDataset,
        recordCount: 800,
        purpose: '',
      };
    case 'create_anomaly':
      return {
        title: '',
        severity: 'medium',
        service: partner === 'eztrac' ? 'Forecasting' : 'Capacity planning',
        impact: '',
        deltaPercent: 10,
      };
    case 'resolve_anomaly':
      return { id: '' };
    case 'update_budget':
      return { id: 'team-platform', budget: 150000, owner: '' };
    case 'chat_intent':
      return { query: '', preferredRoute: '/govern/exchange' };
    case 'resolve_conflict':
    case 'acknowledge_signal':
    case 'advance_stage':
      return { id: '' };
    default:
      return {};
  }
}

function needsForm(dataset: string): boolean {
  return (
    !['request_sync', 'pull_published', 'simulate_inbound_sync', 'pull_outbound'].includes(dataset) &&
    dataset !== 'allocation_matrix' &&
    dataset !== 'squad_matrix'
  );
}

function recordsFromForm(
  dataset: string,
  form: FormState,
  partner: 'eztrac' | 'dhub-rpt'
): unknown[] {
  switch (dataset) {
    case 'inbound_request':
      return [
        {
          fromApp: partner,
          dataset: String(form.dataset),
          recordCount: Number(form.recordCount) || 0,
          purpose: String(form.purpose).trim() || `Request from ${partner}`,
        },
      ];
    case 'create_anomaly':
      return [
        {
          title: String(form.title).trim() || 'Partner-reported incident',
          severity: String(form.severity),
          service: String(form.service).trim() || 'Unknown',
          impact: String(form.impact).trim() || 'Pending review',
          deltaPercent: Number(form.deltaPercent) || 0,
        },
      ];
    case 'resolve_anomaly':
      return [{ id: String(form.id).trim() }];
    case 'update_budget':
      return [
        {
          id: String(form.id).trim(),
          budget: Number(form.budget) || 0,
          owner: String(form.owner).trim(),
        },
      ];
    case 'chat_intent':
      return [
        {
          query: String(form.query).trim(),
          preferredRoute: String(form.preferredRoute).trim() || '/',
        },
      ];
    case 'resolve_conflict':
    case 'acknowledge_signal':
    case 'advance_stage':
      return [{ id: String(form.id).trim() }];
    case 'request_sync':
    case 'pull_published':
    case 'simulate_inbound_sync':
    case 'pull_outbound':
      return [{ partner }];
    default:
      return [{ partner, note: 'custom payload' }];
  }
}

export function SendToFlexDialog({
  open,
  plugin,
  dataset: initialDataset,
  appName,
  partner,
  defaultFlexDataset,
  busy,
  onClose,
  onSend,
}: SendToFlexDialogProps) {
  const sendOptions = useMemo(
    () => (plugin ? sendDatasets(plugin) : []),
    [plugin]
  );

  const [dataset, setDataset] = useState(initialDataset);
  const [form, setForm] = useState<FormState>(() =>
    defaultForm(initialDataset, partner, defaultFlexDataset)
  );

  useEffect(() => {
    if (!open) return;
    setDataset(initialDataset);
    setForm(defaultForm(initialDataset, partner, defaultFlexDataset));
  }, [open, initialDataset, partner, defaultFlexDataset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const changeDataset = (next: string) => {
    setDataset(next);
    setForm(defaultForm(next, partner, defaultFlexDataset));
  };

  if (!open || !plugin) return null;

  const showForm = needsForm(dataset);
  const workspaceOnly = dataset === 'allocation_matrix' || dataset === 'squad_matrix';

  const canSubmit =
    !workspaceOnly &&
    (!showForm ||
      (dataset === 'inbound_request'
        ? String(form.purpose).trim().length > 0 && Number(form.recordCount) > 0
        : dataset === 'create_anomaly'
          ? String(form.title).trim().length > 0
          : dataset === 'chat_intent'
            ? String(form.query).trim().length > 0
            : dataset === 'resolve_anomaly' || dataset === 'resolve_conflict'
              ? String(form.id).trim().length > 0
              : true));

  const set = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="send-dialog-backdrop"
      role="presentation"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="send-dialog"
        role="dialog"
        aria-labelledby="send-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="send-dialog-header">
          <div>
            <h2 id="send-dialog-title">Send to Flex</h2>
            <p className="send-dialog-sub">
              {plugin.name} · from {appName}
            </p>
          </div>
          <button type="button" className="btn btn-ghost" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {sendOptions.length > 1 && (
          <label className="send-field">
            <span>Action</span>
            <select value={dataset} onChange={(e) => changeDataset(e.target.value)}>
              {sendOptions.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.description || d.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {!showForm && dataset === 'allocation_matrix' && (
          <p className="send-dialog-note">
            To push allocation edits, open the <strong>Workspace</strong> tab: Read <strong>allocation_matrix</strong>,
            edit rows in Edit mode, then use <strong>Send to Flex</strong> there.
          </p>
        )}

        {!showForm && dataset === 'squad_matrix' && (
          <p className="send-dialog-note">
            To push squad edits, use the <strong>Workspace</strong> tab after reading <strong>squad_matrix</strong>.
          </p>
        )}

        {!showForm &&
          dataset !== 'allocation_matrix' &&
          dataset !== 'squad_matrix' && (
          <p className="send-dialog-note">
            This will trigger <strong>{dataset}</strong> from {appName} into Flex (demo sync). No extra
            fields required.
          </p>
        )}

        {dataset === 'inbound_request' && (
          <>
            <label className="send-field">
              <span>Flex dataset</span>
              <select value={String(form.dataset)} onChange={(e) => set('dataset', e.target.value)}>
                <option value="forecast_variance">forecast_variance (EzTrac)</option>
                <option value="capacity_forecast">capacity_forecast (dhub-rpt)</option>
                <option value="monthly_spend_by_service">monthly_spend_by_service</option>
              </select>
            </label>
            <label className="send-field">
              <span>Record count</span>
              <input
                type="number"
                min={1}
                value={Number(form.recordCount)}
                onChange={(e) => set('recordCount', Number(e.target.value))}
              />
            </label>
            <label className="send-field">
              <span>Purpose (required)</span>
              <textarea
                rows={3}
                placeholder="e.g. Q3 forecast variance reconciliation"
                value={String(form.purpose)}
                onChange={(e) => set('purpose', e.target.value)}
              />
            </label>
          </>
        )}

        {dataset === 'create_anomaly' && (
          <>
            <label className="send-field">
              <span>Title (required)</span>
              <input
                value={String(form.title)}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Brief incident title"
              />
            </label>
            <label className="send-field">
              <span>Severity</span>
              <select value={String(form.severity)} onChange={(e) => set('severity', e.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>
            <label className="send-field">
              <span>Service</span>
              <input value={String(form.service)} onChange={(e) => set('service', e.target.value)} />
            </label>
            <label className="send-field">
              <span>Impact</span>
              <input
                value={String(form.impact)}
                onChange={(e) => set('impact', e.target.value)}
                placeholder="Business impact"
              />
            </label>
            <label className="send-field">
              <span>Delta %</span>
              <input
                type="number"
                value={Number(form.deltaPercent)}
                onChange={(e) => set('deltaPercent', Number(e.target.value))}
              />
            </label>
          </>
        )}

        {(dataset === 'resolve_anomaly' ||
          dataset === 'resolve_conflict' ||
          dataset === 'acknowledge_signal' ||
          dataset === 'advance_stage') && (
          <label className="send-field">
            <span>Record ID (required)</span>
            <input
              value={String(form.id)}
              onChange={(e) => set('id', e.target.value)}
              placeholder="e.g. a1 or dr-123"
            />
            <span className="send-hint">Read anomalies first to copy an id from the response.</span>
          </label>
        )}

        {dataset === 'update_budget' && (
          <>
            <label className="send-field">
              <span>Team / row ID</span>
              <input value={String(form.id)} onChange={(e) => set('id', e.target.value)} />
            </label>
            <label className="send-field">
              <span>Budget (USD)</span>
              <input
                type="number"
                value={Number(form.budget)}
                onChange={(e) => set('budget', Number(e.target.value))}
              />
            </label>
            <label className="send-field">
              <span>Owner</span>
              <input value={String(form.owner)} onChange={(e) => set('owner', e.target.value)} />
            </label>
          </>
        )}

        {dataset === 'chat_intent' && (
          <>
            <label className="send-field">
              <span>Question (required)</span>
              <textarea
                rows={3}
                value={String(form.query)}
                onChange={(e) => set('query', e.target.value)}
                placeholder="What should Flex AI help with?"
              />
            </label>
            <label className="send-field">
              <span>Preferred Flex route</span>
              <input
                value={String(form.preferredRoute)}
                onChange={(e) => set('preferredRoute', e.target.value)}
              />
            </label>
          </>
        )}

        <footer className="send-dialog-footer">
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-send"
            disabled={busy || !canSubmit}
            onClick={() => onSend(dataset, recordsFromForm(dataset, form, partner))}
          >
            <Send size={16} />
            Send to Flex
          </button>
        </footer>
      </div>
    </div>
  );
}
