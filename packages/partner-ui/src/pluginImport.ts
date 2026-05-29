/** Normalized Flex plugin read — stored in partner workspace. */

export interface PluginImportMeta {
  exportedAt?: string;
  recordCount?: number;
  schema?: string[];
}

export interface PluginImport {
  id: string;
  pluginId: string;
  pluginName: string;
  dataset: string;
  fetchedAt: string;
  records: Record<string, unknown>[];
  meta?: PluginImportMeta;
}

export interface ConsumeResponse {
  ok?: boolean;
  pluginId?: string;
  dataset?: string;
  records?: unknown[];
  meta?: PluginImportMeta;
  error?: string;
}

const STORAGE_PREFIX = 'partner-imports:';

export function storageKey(appId: string): string {
  return `${STORAGE_PREFIX}${appId}`;
}

export function loadImports(appId: string): PluginImport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(storageKey(appId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PluginImport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveImports(appId: string, imports: PluginImport[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(storageKey(appId), JSON.stringify(imports));
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row) => row && typeof row === 'object') as Record<string, unknown>[];
}

export function createImport(
  pluginId: string,
  pluginName: string,
  dataset: string,
  response: ConsumeResponse
): PluginImport | null {
  if (!response.ok) return null;
  const records = asRecords(response.records);
  return {
    id: `${pluginId}:${dataset}:${Date.now()}`,
    pluginId,
    pluginName,
    dataset,
    fetchedAt: new Date().toISOString(),
    records,
    meta: response.meta,
  };
}

export function upsertImport(imports: PluginImport[], next: PluginImport): PluginImport[] {
  const without = imports.filter((i) => !(i.pluginId === next.pluginId && i.dataset === next.dataset));
  return [next, ...without].slice(0, 24);
}
