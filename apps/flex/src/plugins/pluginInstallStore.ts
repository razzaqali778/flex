import type { InstalledExtension } from './types';
import { PLUGIN_CHANGE_EVENT } from './corePluginStore';

const STORAGE_KEY = 'flex_installed_extensions_v1';

function readAll(): InstalledExtension[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InstalledExtension[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: InstalledExtension[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(PLUGIN_CHANGE_EVENT));
}

export function getInstalledExtensions(): InstalledExtension[] {
  return readAll();
}

export function writeInstalledExtensions(list: InstalledExtension[]): void {
  writeAll(list);
}

export function isExtensionInstalled(id: string): boolean {
  return readAll().some((e) => e.id === id);
}

export function isExtensionEnabled(id: string): boolean {
  const row = readAll().find((e) => e.id === id);
  return row?.enabled ?? false;
}

export function installExtension(
  id: string,
  version: string,
  meta?: Pick<InstalledExtension, 'source' | 'packagePath'>
): InstalledExtension {
  const list = readAll().filter((e) => e.id !== id);
  const entry: InstalledExtension = {
    id,
    version,
    installedAt: new Date().toISOString(),
    enabled: true,
    source: meta?.source ?? 'marketplace',
    packagePath: meta?.packagePath,
  };
  writeAll([...list, entry]);
  return entry;
}

export function uninstallExtension(id: string): boolean {
  if (!id.startsWith('flex.ext.')) return false;
  writeAll(readAll().filter((e) => e.id !== id));
  return true;
}

export function setExtensionEnabled(id: string, enabled: boolean): void {
  writeAll(readAll().map((e) => (e.id === id ? { ...e, enabled } : e)));
}

export function subscribeExtensionChanges(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(PLUGIN_CHANGE_EVENT, handler);
  return () => window.removeEventListener(PLUGIN_CHANGE_EVENT, handler);
}
