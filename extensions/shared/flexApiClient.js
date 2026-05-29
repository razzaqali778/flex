/**
 * Chrome / popup — call Flex plugin API (same as VS Code + web).
 * Catalog: extensions/shared/extensionCatalog.json
 */

export async function flexApiRequest(apiUrl, path, body) {
  const base = apiUrl.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function runCatalogAction(action, apiUrl) {
  if (action.kind === 'connect') {
    return flexApiRequest(apiUrl, '/health');
  }
  if (action.kind === 'consume') {
    return flexApiRequest(apiUrl, '/api/v1/consume', {
      pluginId: action.pluginId,
      dataset: action.dataset,
    });
  }
  if (action.kind === 'produce') {
    return flexApiRequest(apiUrl, '/api/v1/produce', {
      pluginId: action.pluginId,
      dataset: action.dataset,
      records: action.records || [],
      sourceApp: 'eztrac',
    });
  }
  throw new Error(`Unsupported action kind: ${action.kind}`);
}
