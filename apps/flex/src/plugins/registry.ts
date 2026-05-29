import type { FlexPluginDefinition, PluginCatalogEntry } from './types';
import {
  getActivePlugin,
  getPluginCatalog as buildPluginCatalog,
  listActivePlugins,
} from './manager';

export function listPlugins(): FlexPluginDefinition[] {
  return listActivePlugins();
}

export function getPlugin(id: string): FlexPluginDefinition | undefined {
  return getActivePlugin(id);
}

export function getPluginCatalog(): PluginCatalogEntry[] {
  return buildPluginCatalog();
}

export function getPluginsByCategory(category: FlexPluginDefinition['manifest']['category']) {
  return listActivePlugins().filter((p) => p.manifest.category === category);
}
