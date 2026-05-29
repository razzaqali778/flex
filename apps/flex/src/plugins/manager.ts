import { CORE_PLUGINS } from './corePlugins';
import { EXTENSION_BUNDLES } from './marketplace/bundles';
import { MARKETPLACE_CATALOG } from './marketplace/catalog';
import {
  isCorePluginEnabled,
  migrateLegacyCoreInstalls,
  setCorePluginEnabled,
} from './corePluginStore';
import {
  getInstalledExtensions,
  installExtension,
  isExtensionEnabled,
  isExtensionInstalled,
  setExtensionEnabled,
  uninstallExtension,
} from './pluginInstallStore';
import type {
  FlexPluginDefinition,
  InstalledExtension,
  MarketplaceListing,
  PluginCatalogEntry,
} from './types';

function ensureStore() {
  migrateLegacyCoreInstalls();
}

export function getEnabledExtensionPlugins(): FlexPluginDefinition[] {
  ensureStore();
  return getInstalledExtensions()
    .filter((e) => e.enabled && e.id.startsWith('flex.ext.'))
    .map((e) => EXTENSION_BUNDLES[e.id])
    .filter((p): p is FlexPluginDefinition => !!p);
}

/** Core (always registered) + enabled marketplace extensions */
export function listActivePlugins(): FlexPluginDefinition[] {
  ensureStore();
  const core = CORE_PLUGINS.filter((p) => isCorePluginEnabled(p.manifest.id));
  return [...core, ...getEnabledExtensionPlugins()];
}

export function isPluginEnabled(pluginId: string): boolean {
  ensureStore();
  if (pluginId.startsWith('flex.ext.')) {
    return isExtensionEnabled(pluginId);
  }
  if (CORE_PLUGINS.some((p) => p.manifest.id === pluginId)) {
    return isCorePluginEnabled(pluginId);
  }
  return false;
}

export function getActivePlugin(id: string): FlexPluginDefinition | undefined {
  return listActivePlugins().find((p) => p.manifest.id === id);
}

export function getPluginCatalog(): PluginCatalogEntry[] {
  return listActivePlugins().map((p) => ({
    ...p.manifest,
    kind: p.manifest.kind ?? (p.manifest.id.startsWith('flex.ext.') ? 'extension' : 'core'),
    datasetCount: p.manifest.datasets.length,
  }));
}

export function getCorePluginCatalog(): PluginCatalogEntry[] {
  return CORE_PLUGINS.map((p) => ({
    ...p.manifest,
    kind: 'core' as const,
    datasetCount: p.manifest.datasets.length,
  }));
}

export function listMarketplace(): MarketplaceListing[] {
  return MARKETPLACE_CATALOG;
}

export function listInstalledExtensions(): InstalledExtension[] {
  return getInstalledExtensions();
}

export function installFromMarketplace(id: string): InstalledExtension | { error: string } {
  const listing = MARKETPLACE_CATALOG.find((l) => l.id === id);
  if (!listing) return { error: 'Extension not found in marketplace' };
  if (!EXTENSION_BUNDLES[id]) return { error: 'Extension bundle missing' };
  return installExtension(id, listing.version, { source: 'marketplace' });
}

export { parseExtensionPackage, installFromPackage, installFromPackageUrl } from './marketplace/packageInstaller';

export function uninstallFromMarketplace(id: string): { ok: boolean; error?: string } {
  const ok = uninstallExtension(id);
  return ok ? { ok: true } : { ok: false, error: 'Extension not installed' };
}

export function toggleExtension(id: string, enabled: boolean): void {
  if (id.startsWith('flex.ext.')) {
    if (!isExtensionInstalled(id)) return;
    setExtensionEnabled(id, enabled);
    return;
  }
  if (CORE_PLUGINS.some((p) => p.manifest.id === id)) {
    setCorePluginEnabled(id, enabled);
  }
}

export function extensionInstallState(id: string): 'not_installed' | 'disabled' | 'enabled' {
  if (id.startsWith('flex.ext.')) {
    if (!isExtensionInstalled(id)) return 'not_installed';
    return isExtensionEnabled(id) ? 'enabled' : 'disabled';
  }
  if (CORE_PLUGINS.some((p) => p.manifest.id === id)) {
    return isCorePluginEnabled(id) ? 'enabled' : 'disabled';
  }
  return 'not_installed';
}
