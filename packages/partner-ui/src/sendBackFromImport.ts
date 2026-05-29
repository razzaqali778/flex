import type { PluginImport } from './pluginImport';
import {
  canSendToFlex,
  primarySendDataset,
  type PluginListing,
} from './types';
import { resolveViewKind } from './viewRegistry';

/** Pick a send target for workspace data that was read from Flex. */
export function sendBackFromImport(
  imp: PluginImport,
  publishedById: Map<string, PluginListing>
): { plugin: PluginListing; dataset: string } | null {
  const samePlugin = publishedById.get(imp.pluginId);
  if (samePlugin && canSendToFlex(samePlugin)) {
    const ds = primarySendDataset(samePlugin);
    if (ds) return { plugin: samePlugin, dataset: ds.name };
  }

  const view = resolveViewKind(imp);
  const hints: { pluginId: string; dataset: string }[] = [];

  if (view === 'anomalies' || imp.dataset.includes('anomaly')) {
    hints.push({ pluginId: 'flex.anomalies', dataset: 'create_anomaly' });
    hints.push({ pluginId: 'flex.anomalies', dataset: 'resolve_anomaly' });
  }
  if (view === 'chargeback' || imp.dataset.includes('showback')) {
    hints.push({ pluginId: 'flex.governance', dataset: 'inbound_request' });
  }
  if (view === 'resources' || view === 'workforce' || imp.dataset.includes('allocation')) {
    hints.push({ pluginId: 'flex.integrations', dataset: 'simulate_inbound_sync' });
    hints.push({ pluginId: 'flex.governance', dataset: 'inbound_request' });
  }
  if (view === 'alignment') {
    hints.push({ pluginId: 'flex.alignment', dataset: 'resolve_conflict' });
  }
  if (view === 'savings') {
    hints.push({ pluginId: 'flex.optimization', dataset: 'advance_stage' });
  }

  for (const hint of hints) {
    const plugin = publishedById.get(hint.pluginId);
    if (!plugin || !canSendToFlex(plugin)) continue;
    const datasets = plugin.datasets ?? [];
    if (datasets.some((d) => d.name === hint.dataset)) {
      return { plugin, dataset: hint.dataset };
    }
    const fallback = primarySendDataset(plugin);
    if (fallback) return { plugin, dataset: fallback.name };
  }

  return null;
}
