import { Database, Download } from 'lucide-react';
import type { PartnerAppId } from './partnerLocalContext';
import { RECOMMENDED_READS } from './viewRegistry';

export interface ReadFromFlexPanelProps {
  appId: PartnerAppId;
  appName: string;
  marketplaceUrl: string;
  busy?: boolean;
  onRead: (pluginId: string, dataset: string) => void;
  onOpenInstalled?: () => void;
}

/** Compact sidebar control — pull datasets from Flex (consume). */
export function ReadFromFlexPanel({
  appId,
  appName,
  marketplaceUrl,
  busy,
  onRead,
  onOpenInstalled,
}: ReadFromFlexPanelProps) {
  const recommended = RECOMMENDED_READS[appId];

  return (
    <section className="workspace-read-panel workspace-read-panel--compact">
      <div className="workspace-read-header">
        <Database size={16} />
        <h4>Pull from Flex</h4>
      </div>
      <p className="workspace-read-lead">
        Loads a read-only snapshot into the workspace. Use <strong>Read</strong> mode to explore, then{' '}
        <strong>Edit & send</strong> to push changes.
      </p>
      <div className="workspace-read-actions">
        {recommended.map((r) => (
          <button
            key={`${r.pluginId}-${r.dataset}`}
            type="button"
            className="btn btn-primary workspace-read-btn"
            disabled={busy}
            title={`${r.pluginId} · ${r.dataset}`}
            onClick={() => onRead(r.pluginId, r.dataset)}
          >
            <Download size={14} />
            {r.label}
          </button>
        ))}
      </div>
      <p className="workspace-read-footer">
        {onOpenInstalled ? (
          <>
            <button type="button" className="link-btn" onClick={onOpenInstalled}>
              More datasets
            </button>
            {' · '}
          </>
        ) : null}
        <a href={marketplaceUrl} target="_blank" rel="noreferrer">
          Marketplace
        </a>
        {' · '}
        {appName}
      </p>
    </section>
  );
}
