import { CORE_PLUGINS } from '../corePlugins';
import { EXTENSION_BUNDLES } from '../marketplace/bundles';
import type { FlexFrontendPlugin } from '../frontend/types';
import { CORE_FRONTEND_FEATURES } from '../frontend/features/coreFeatures';
import type { FlexPluginDefinition } from '../types';
import {
  buildDashboardHub,
  buildGovernanceTabs,
  buildNavSections,
  buildSearchPages,
} from './buildNavFromFeatures';
import type { RouteBinding } from './types';

export interface FlexAppConfig {
  corePlugins?: FlexPluginDefinition[];
  extensionBundles?: Record<string, FlexPluginDefinition>;
  /** Backstage `features` — frontend plugins with extensions */
  features?: FlexFrontendPlugin[];
}

/**
 * App shell — wires data plugins + frontend features (Backstage App model).
 */
export function createFlexApp(config: FlexAppConfig = {}) {
  const corePlugins = config.corePlugins ?? CORE_PLUGINS;
  const extensionBundles = config.extensionBundles ?? EXTENSION_BUNDLES;
  const features = config.features ?? CORE_FRONTEND_FEATURES;

  const coreById = new Map(corePlugins.map((p) => [p.manifest.id, p]));
  const featuresById = new Map(features.map((f) => [f.pluginId, f]));

  return {
    corePlugins,
    extensionBundles,
    features,

    getCorePlugin(id: string): FlexPluginDefinition | undefined {
      return coreById.get(id);
    },

    getExtensionPlugin(id: string): FlexPluginDefinition | undefined {
      return extensionBundles[id];
    },

    getPlugin(id: string): FlexPluginDefinition | undefined {
      return coreById.get(id) ?? extensionBundles[id];
    },

    getFrontendPlugin(id: string): FlexFrontendPlugin | undefined {
      return featuresById.get(id);
    },

    /** Resolve a named route (Backstage routeRef-style) to a concrete path */
    resolveRoute(pluginId: string, routeName: string): string | undefined {
      return featuresById.get(pluginId)?.routes[routeName];
    },

    listRouteBindings(): RouteBinding[] {
      const fromData = corePlugins
        .filter((p) => p.manifest.route && p.manifest.route !== '/plugins')
        .map((p) => ({ path: p.manifest.route, pluginId: p.manifest.id }));

      const fromPages = features.flatMap((plugin) =>
        plugin.extensions
          .filter((ext) => ext.kind === 'page')
          .map((ext) => ({ path: (ext as { path: string }).path, pluginId: plugin.pluginId }))
      );

      const merged = new Map<string, RouteBinding>();
      for (const row of [...fromData, ...fromPages]) {
        if (row.path) merged.set(row.path, row);
      }
      return [...merged.values()];
    },

    getNavSections() {
      return buildNavSections(features);
    },

    getGovernanceTabs() {
      return buildGovernanceTabs(features);
    },

    getDashboardHub() {
      return buildDashboardHub(features);
    },

    getSearchPages() {
      return buildSearchPages(features);
    },
  };
}

/** Default Flex app — data plugins + frontend features */
export const flexApp = createFlexApp();
