import type { ExtensionAction } from './catalog.js';

export interface RunActionResult {
  ok: boolean;
  title: string;
  data?: unknown;
  error?: string;
  hint?: string;
}

export async function runExtensionAction(
  action: ExtensionAction,
  options: { apiUrl: string; fetchFn?: typeof fetch }
): Promise<RunActionResult> {
  const fetchImpl = options.fetchFn ?? fetch;
  const base = options.apiUrl.replace(/\/$/, '');

  if (action.kind === 'connect') {
    try {
      const res = await fetchImpl(`${base}/health`);
      const data = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, title: 'Connected', data };
    } catch (e) {
      return {
        ok: false,
        title: 'Connect failed',
        error: e instanceof Error ? e.message : String(e),
        hint: 'Run: npm run api',
      };
    }
  }

  if (action.kind === 'consume' && action.pluginId && action.dataset) {
    try {
      const res = await fetchImpl(`${base}/api/v1/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId: action.pluginId, dataset: action.dataset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      return { ok: true, title: action.label, data };
    } catch (e) {
      return {
        ok: false,
        title: action.label,
        error: e instanceof Error ? e.message : String(e),
        hint: 'Start flex-api and sync state from the web app',
      };
    }
  }

  if (action.kind === 'produce' && action.pluginId && action.dataset) {
    try {
      const res = await fetchImpl(`${base}/api/v1/produce`, {
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
      return { ok: true, title: action.label, data, hint: 'Refresh Flex web app to see changes' };
    } catch (e) {
      return {
        ok: false,
        title: action.label,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return { ok: false, title: action.label, error: `Action kind not supported in API runner: ${action.kind}` };
}
