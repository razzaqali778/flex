import type { ExtensionAction } from './catalogTypes';

export async function runCatalogAction(
  action: ExtensionAction,
  apiUrl: string
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const base = apiUrl.replace(/\/$/, '');

  try {
    if (action.kind === 'connect') {
      const res = await fetch(`${base}/health`);
      const data = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, data };
    }

    if (action.kind === 'consume' && action.pluginId && action.dataset) {
      const res = await fetch(`${base}/api/v1/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId: action.pluginId, dataset: action.dataset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      return { ok: true, data };
    }

    if (action.kind === 'produce' && action.pluginId && action.dataset) {
      const res = await fetch(`${base}/api/v1/produce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pluginId: action.pluginId,
          dataset: action.dataset,
          records: action.records ?? [],
          sourceApp: 'eztrac',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      return { ok: true, data };
    }

    return { ok: false, error: `Unsupported: ${action.kind}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
