import { EXTENSION_BUNDLES } from './bundles';
import { MARKETPLACE_CATALOG } from './catalog';
import { installExtension } from '../pluginInstallStore';
import type { FlexExtensionPackage, InstalledExtension } from '../types';

function resolvePluginId(pkg: Partial<FlexExtensionPackage>): string | undefined {
  if (pkg.id && EXTENSION_BUNDLES[pkg.id]) return pkg.id;
  if (pkg.entry && EXTENSION_BUNDLES[pkg.entry]) return pkg.entry;
  return undefined;
}

function validatePackage(pkg: unknown): FlexExtensionPackage | { error: string } {
  if (!pkg || typeof pkg !== 'object') return { error: 'Invalid package file' };
  const p = pkg as Partial<FlexExtensionPackage>;
  if (!p.id?.startsWith('flex.')) {
    return { error: 'Package id must start with flex.' };
  }
  if (!p.name || !p.version || !p.publisher) {
    return { error: 'Package requires id, name, version, publisher' };
  }
  const pluginId = resolvePluginId(p);
  if (!pluginId) {
    return { error: `Unknown package id or entry. Not in Flex extension registry.` };
  }
  if (p.id !== pluginId && p.entry !== pluginId) {
    return { error: `Package id ${p.id} must match bundle ${pluginId}` };
  }
  return { ...p, id: pluginId, entry: p.entry ?? pluginId } as FlexExtensionPackage;
}

export function parseExtensionPackage(json: string): FlexExtensionPackage | { error: string } {
  try {
    return validatePackage(JSON.parse(json));
  } catch {
    return { error: 'Could not parse .flexext.json' };
  }
}

export function installFromPackage(
  pkg: FlexExtensionPackage,
  source: 'package' | 'url' = 'package',
  packagePath?: string
): InstalledExtension | { error: string } {
  const pluginId = pkg.id;
  if (!EXTENSION_BUNDLES[pluginId]) {
    return { error: 'Extension bundle not available in this Flex build' };
  }

  return installExtension(pluginId, pkg.version, {
    source,
    packagePath: packagePath ?? pkg.entry,
  });
}

export async function installFromPackageUrl(url: string): Promise<InstalledExtension | { error: string }> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { error: `Download failed: ${res.status}` };
    const text = await res.text();
    const parsed = parseExtensionPackage(text);
    if ('error' in parsed) return parsed;
    return installFromPackage(parsed, 'url', url);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Download failed' };
  }
}

export function extensionPackageTemplate(pluginId: string): FlexExtensionPackage | null {
  const listing = MARKETPLACE_CATALOG.find((l) => l.id === pluginId);
  if (!listing) return null;
  return {
    id: pluginId,
    name: listing.name,
    version: listing.version,
    publisher: listing.publisher,
    description: listing.description,
    entry: pluginId,
    engines: { flex: '^1.0.0' },
    permissions: listing.permissions,
    icon: listing.icon,
    categories: [listing.category],
  };
}
