import { CORE_PLUGINS } from '../plugins/corePlugins';
import { isPluginEnabled } from '../plugins/manager';
import { pluginIdForPath } from '../plugins/app/routeBindings';
import type { MarketplaceCategory } from '../plugins/types';

const ICONS: Record<string, string> = {
  'flex.dashboard': '📊',
  'flex.governance': '🛡️',
  'flex.integrations': '🔗',
  'flex.alignment': '↔️',
  'flex.cloud-usage': '☁️',
  'flex.optimization': '💰',
  'flex.anomalies': '⚠️',
  'flex.chargeback': '🧾',
  'flex.workforce': '👥',
  'flex.resources': '⚡',
  'flex.assistant': '✨',
  'flex.settings': '⚙️',
  'flex.extension': '🧩',
  'flex.partner.eztrac': '📗',
  'flex.partner.dhub-rpt': '📘',
};

const CATEGORY_MAP: Record<string, MarketplaceCategory> = {
  overview: 'overview',
  governance: 'governance',
  cost: 'cost',
  org: 'organization',
  tools: 'tools',
  extension: 'integrations',
};

/** Core Flex feature plugins — enable/disable without marketplace install */
export const FEATURE_PLUGIN_LIST = CORE_PLUGINS.map((p) => {
  const m = p.manifest;
  return {
    id: m.id,
    name: m.name,
    version: m.version,
    description: m.description,
    route: m.route,
    icon: ICONS[m.id] ?? '📦',
    category: CATEGORY_MAP[m.category] ?? 'tools',
  };
});

export function isFeatureRouteEnabled(routeOrTo: string): boolean {
  const pluginId = pluginIdForPath(routeOrTo);
  if (!pluginId) return true;
  return isPluginEnabled(pluginId);
}

type Routable = { route?: string; to?: string; pluginId?: string };

export function filterRoutesByFeaturePlugins<T extends Routable>(items: T[]): T[] {
  return items.filter((item) => {
    const path = item.route ?? item.to ?? '/';
    const pluginId = item.pluginId ?? pluginIdForPath(path);
    if (!pluginId) return true;
    return isPluginEnabled(pluginId);
  });
}
