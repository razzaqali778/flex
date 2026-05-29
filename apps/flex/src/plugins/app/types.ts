/**
 * Backstage-aligned terminology (https://backstage.io/docs/overview/architecture-overview/)
 *
 * - Core: framework primitives (plugin host, routes, bridge) — not uninstallable
 * - App: deployed Flex instance; wires core plugins + installed extensions
 * - Plugins: features (core = shipped with Flex, extension = marketplace add-ons)
 * - Extensions: UI contributions (nav items, routes) derived from plugin manifests
 */

export type PluginScope = 'core' | 'extension';

export interface RouteBinding {
  path: string;
  pluginId: string;
}
