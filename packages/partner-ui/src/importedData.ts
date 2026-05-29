import type { PluginImport } from './pluginImport';

/** Shape returned by Flex consume — use for typing partner app logic. */
export interface FlexConsumeResult {
  ok?: boolean;
  pluginId?: string;
  dataset?: string;
  records?: Record<string, unknown>[];
  meta?: PluginImport['meta'];
  error?: string;
}

/** Read request to replay a workspace import from Flex. */
export function consumeRequestForImport(imp: PluginImport): {
  pluginId: string;
  dataset: string;
} {
  return { pluginId: imp.pluginId, dataset: imp.dataset };
}

/** Typed rows from a workspace import (session snapshot after consume). */
export function recordsFromImport(imp: PluginImport): Record<string, unknown>[] {
  return imp.records;
}

/** JSON suitable for copying into tests or external ETL. */
export function exportImportJson(imp: PluginImport): string {
  return JSON.stringify(
    {
      pluginId: imp.pluginId,
      dataset: imp.dataset,
      fetchedAt: imp.fetchedAt,
      records: imp.records,
      meta: imp.meta,
    },
    null,
    2
  );
}
