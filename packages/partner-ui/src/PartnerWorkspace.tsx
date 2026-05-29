import { useEffect, useState } from 'react';
import { Database, Download, Eye, Inbox, Lightbulb, Pencil, Send, Trash2 } from 'lucide-react';
import type { PluginImport } from './pluginImport';
import { formatRelativeTime } from './formatTime';
import { buildWorkspaceInsights, type WorkspaceInsight } from './partnerInsights';
import { getPartnerLocalContext, type PartnerAppId } from './partnerLocalContext';
import { ReadFromFlexPanel } from './ReadFromFlexPanel';
import { resolveViewKind, VIEW_LABELS } from './viewRegistry';
import { PluginDataView, type DataViewMode } from './views/PluginDataViews';

export interface PartnerWorkspaceProps {
  appId: PartnerAppId;
  appName: string;
  marketplaceUrl: string;
  imports: PluginImport[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onInsightAction?: (insight: WorkspaceInsight) => void;
  onRead?: (pluginId: string, dataset: string) => void;
  onOpenInstalledTab?: () => void;
  busy?: boolean;
  onSendSelected?: () => void;
  canSendSelected?: boolean;
  sendPreview?: string;
  onUpdateRecords?: (importId: string, records: Record<string, unknown>[]) => void;
}

function LocalContextPanel({ appId }: { appId: PartnerAppId }) {
  const local = getPartnerLocalContext(appId);

  if (local.kind === 'eztrac') {
    return (
      <section className="workspace-local">
        <h4>Your EzTrac context</h4>
        <p>
          FY{local.fiscalYear} · {local.activeInitiativeCount} active initiatives · VIP budgets loaded
        </p>
        <ul className="workspace-local-list">
          {local.initiatives.map((i) => (
            <li key={i.initiativeId}>
              <strong>{i.initiativeName}</strong>
              <span>{i.status}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="workspace-local">
      <h4>Your dhub-rpt context</h4>
      <p>
        {local.capacityUtilizationPct}% hub utilization · {local.pendingTransfers} pending transfers ·{' '}
        {local.overAllocatedSquads} over-allocated squad(s)
      </p>
      <ul className="workspace-local-list">
        {local.squads.map((s) => (
          <li key={s.id}>
            <strong>{s.name}</strong>
            <span>
              {s.currentCapacity}/{s.capacity} FTE
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PartnerWorkspace({
  appId,
  appName,
  marketplaceUrl,
  imports,
  selectedId,
  onSelect,
  onRemove,
  onClearAll,
  onInsightAction,
  onRead,
  onOpenInstalledTab,
  busy,
  onSendSelected,
  canSendSelected = false,
  sendPreview,
  onUpdateRecords,
}: PartnerWorkspaceProps) {
  const [dataMode, setDataMode] = useState<DataViewMode>('view');
  const local = getPartnerLocalContext(appId);
  const insights = buildWorkspaceInsights(appId, imports, local);
  const selected = imports.find((i) => i.id === selectedId) ?? imports[0];

  useEffect(() => {
    setDataMode('view');
  }, [selected?.id]);

  return (
    <div className="partner-workspace">
      <div className="workspace-insights">
        <div className="workspace-insights-title">
          <Lightbulb size={18} />
          <h3>Insights for {appName}</h3>
        </div>
        <div className="workspace-insight-cards">
          {insights.map((insight) => (
            <article key={insight.id} className={`insight-card tone-${insight.tone}`}>
              <h4>{insight.title}</h4>
              <p>{insight.detail}</p>
              {insight.actionLabel && onInsightAction && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onInsightAction(insight)}>
                  {insight.actionLabel}
                </button>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="workspace-grid">
        <aside className="workspace-sidebar">
          {onRead && (
            <ReadFromFlexPanel
              appId={appId}
              appName={appName}
              marketplaceUrl={marketplaceUrl}
              busy={busy}
              onRead={onRead}
              onOpenInstalled={onOpenInstalledTab}
            />
          )}

          <section className="workspace-imports">
            <div className="workspace-imports-header">
              <Database size={16} />
              <h4>In workspace</h4>
              {imports.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClearAll}>
                  Clear
                </button>
              )}
            </div>

            {imports.length === 0 ? (
              <div className="workspace-empty-imports">
                <Inbox size={24} className="workspace-empty-icon" aria-hidden />
                <p>Pull a dataset using the buttons above.</p>
              </div>
            ) : (
              <ul className="workspace-import-list">
                {imports.map((imp) => (
                  <li key={imp.id}>
                    <button
                      type="button"
                      className={selected?.id === imp.id ? 'import-item active' : 'import-item'}
                      onClick={() => onSelect(imp.id)}
                    >
                      <span className="import-item-title">{imp.pluginName}</span>
                      <span className="import-item-meta">
                        {VIEW_LABELS[resolveViewKind(imp)]} · {imp.records.length} rows ·{' '}
                        {formatRelativeTime(imp.fetchedAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="import-remove"
                      aria-label="Remove import"
                      onClick={() => onRemove(imp.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <LocalContextPanel appId={appId} />
        </aside>

        <div className="workspace-main">
          {selected ? (
            <>
              <div className="workspace-mode-bar">
                <div className="workspace-mode-toggle" role="tablist" aria-label="Data mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={dataMode === 'view'}
                    className={dataMode === 'view' ? 'active' : ''}
                    onClick={() => setDataMode('view')}
                  >
                    <Eye size={15} />
                    Read
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={dataMode === 'edit'}
                    className={dataMode === 'edit' ? 'active' : ''}
                    onClick={() => setDataMode('edit')}
                  >
                    <Pencil size={15} />
                    Edit & send
                  </button>
                </div>
                {onRead && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy}
                    onClick={() => onRead(selected.pluginId, selected.dataset)}
                  >
                    <Download size={14} />
                    Refresh from Flex
                  </button>
                )}
              </div>

              {dataMode === 'edit' && onUpdateRecords && (
                <div className="workspace-send-bar">
                  <p>{sendPreview ?? 'Edit fields below, then send updates to Flex.'}</p>
                  {canSendSelected && onSendSelected && (
                    <button
                      type="button"
                      className="btn btn-send"
                      disabled={!canSendSelected}
                      onClick={onSendSelected}
                    >
                      <Send size={16} />
                      Send to Flex
                    </button>
                  )}
                </div>
              )}

              <PluginDataView
                imp={selected}
                local={local}
                mode={dataMode}
                onRecordsChange={
                  dataMode === 'edit'
                    ? (records) => onUpdateRecords?.(selected.id, records)
                    : undefined
                }
              />
            </>
          ) : (
            <div className="workspace-placeholder">
              <h3>Select or pull Flex data</h3>
              <p>
                Use <strong>Pull from Flex</strong> on the left, or open the <strong>Installed</strong> tab for
                more datasets. Data opens in <strong>Read</strong> mode; switch to <strong>Edit & send</strong> when
                you need to push changes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
