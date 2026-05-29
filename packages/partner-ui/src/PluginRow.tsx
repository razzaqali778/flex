import { ChevronDown, Database, Download, Send, Trash2 } from 'lucide-react';
import {
  canReadFromFlex,
  canSendToFlex,
  datasetsFor,
  directionLabel,
  primaryReadDataset,
  primarySendDataset,
  type PluginListing,
} from './types';

export interface PluginRowProps {
  plugin: PluginListing;
  installed: boolean;
  busy: boolean;
  mode: 'install' | 'runtime';
  onInstall?: () => void;
  onUninstall?: () => void;
  onRead?: (dataset: string) => void;
  onSend?: (dataset: string) => void;
}

export function PluginRow({
  plugin,
  installed,
  busy,
  mode,
  onInstall,
  onUninstall,
  onRead,
  onSend,
}: PluginRowProps) {
  const datasets = datasetsFor(plugin);
  const readDs = primaryReadDataset(plugin);
  const sendDs = primarySendDataset(plugin);
  const showFlowTags = true;
  const showActions = installed && mode === 'runtime';

  return (
    <article className={`plugin-row${busy ? ' plugin-row-busy' : ''}`}>
      <span className="plugin-row-icon" aria-hidden>
        {plugin.icon || '◆'}
      </span>

      <div className="plugin-row-body">
        <h3>{plugin.name}</h3>
        <div className="plugin-row-meta">
          <span className="plugin-row-id">{plugin.pluginId}</span>
          <span className={`tag ${installed ? 'installed' : ''}`}>
            {installed ? 'Installed' : `v${plugin.version}`}
          </span>
          {plugin.category && <span className="tag">{plugin.category}</span>}
          {showFlowTags && canReadFromFlex(plugin) && canSendToFlex(plugin) && (
            <span className="tag read">Read & send</span>
          )}
          {showFlowTags && canSendToFlex(plugin) && !canReadFromFlex(plugin) && (
            <span className="tag send">Sends to Flex</span>
          )}
          {showFlowTags && canReadFromFlex(plugin) && !canSendToFlex(plugin) && (
            <span className="tag read">Reads from Flex</span>
          )}
        </div>
        <p className="plugin-row-desc">{plugin.description}</p>

        {datasets.length > 0 && (
          <details className="plugin-datasets">
            <summary>
              <ChevronDown size={14} />
              {datasets.length} dataset{datasets.length === 1 ? '' : 's'}
              {showActions && (readDs || sendDs) && (
                <span className="plugin-datasets-hint"> — pick another below</span>
              )}
            </summary>
            <div className="plugin-dataset-grid">
              {datasets.map((dataset) => {
                const canRead =
                  dataset.direction === 'outbound' || dataset.direction === 'bidirectional';
                const canSend =
                  dataset.direction === 'inbound' || dataset.direction === 'bidirectional';
                const isPrimaryRead = readDs?.name === dataset.name;
                const isPrimarySend = sendDs?.name === dataset.name;
                const showDatasetActions =
                  showActions && !isPrimaryRead && !isPrimarySend;
                return (
                  <div className="plugin-dataset-item" key={dataset.name}>
                    <span>{dataset.description || dataset.name}</span>
                    <span className="plugin-dataset-flow">{directionLabel(dataset.direction)}</span>
                    {showDatasetActions && (
                      <span className="plugin-dataset-actions">
                        {canRead && onRead && (
                          <button
                            type="button"
                            className="btn-dataset"
                            disabled={busy}
                            onClick={() => onRead(dataset.name)}
                          >
                            Read
                          </button>
                        )}
                        {canSend && onSend && (
                          <button
                            type="button"
                            className="btn-dataset send"
                            disabled={busy}
                            onClick={() => onSend(dataset.name)}
                          >
                            Send
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>

      <div className="plugin-row-actions">
        {!installed ? (
          <button className="btn btn-primary" type="button" disabled={busy} onClick={onInstall}>
            <Download size={15} />
            Install
          </button>
        ) : (
          <>
            {showActions && readDs && onRead && (
              <button
                className="btn btn-ghost"
                type="button"
                disabled={busy}
                title={`Read dataset: ${readDs.name}`}
                onClick={() => onRead(readDs.name)}
              >
                <Database size={15} />
                Read
              </button>
            )}
            {showActions && sendDs && onSend && (
              <button
                className="btn btn-send"
                type="button"
                disabled={busy}
                title={`Send dataset: ${sendDs.name}`}
                onClick={() => onSend(sendDs.name)}
              >
                <Send size={15} />
                Send to Flex
              </button>
            )}
            {onUninstall && (
              <button className="btn btn-danger" type="button" disabled={busy} onClick={onUninstall}>
                <Trash2 size={15} />
                Remove
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
