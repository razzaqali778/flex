import { getInstalledExtensions, writeInstalledExtensions } from './pluginInstallStore';

const DISABLED_KEY = 'flex_core_disabled_v1';
const MIGRATED_KEY = 'flex_core_migrated_v1';
export const PLUGIN_CHANGE_EVENT = 'flex-extensions-changed';

function readDisabled(): Set<string> {
  try {
    const raw = localStorage.getItem(DISABLED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeDisabled(ids: Set<string>): void {
  localStorage.setItem(DISABLED_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent(PLUGIN_CHANGE_EVENT));
}

export function isCorePluginEnabled(pluginId: string): boolean {
  return !readDisabled().has(pluginId);
}

export function setCorePluginEnabled(pluginId: string, enabled: boolean): void {
  const disabled = readDisabled();
  if (enabled) disabled.delete(pluginId);
  else disabled.add(pluginId);
  writeDisabled(disabled);
}

/** Move legacy "built-in marketplace" installs into core disable flags */
export function migrateLegacyCoreInstalls(): void {
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const disabled = readDisabled();
  const installed = getInstalledExtensions();
  for (const row of installed) {
    if (row.id.startsWith('flex.') && !row.id.startsWith('flex.ext.')) {
      if (!row.enabled) disabled.add(row.id);
    }
  }
  writeDisabled(disabled);
  writeInstalledExtensions(installed.filter((e) => e.id.startsWith('flex.ext.')));
  localStorage.setItem(MIGRATED_KEY, '1');
}
