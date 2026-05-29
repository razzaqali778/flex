const now = () => new Date().toISOString();

const seedManifests = [
  {
    manifestVersion: '2',
    id: 'com.flex.pdf-exporter',
    name: 'Flex PDF Exporter',
    version: '1.0.0',
    entry: 'index.js',
    description: 'Export governed Flex reports to PDF.',
    iconUrl: '/assets/pdf-exporter.svg',
    category: 'export',
    hostRequirements: { minSdkVersion: '1.0.0' },
    ui: { slots: ['toolbar', 'context-menu'], width: 300, height: 400 },
    permissions: ['storage:read', 'storage:write', 'ui:render', 'event:emit', 'event:listen'],
    capabilities: { exportFormats: ['pdf', 'png'] },
  },
  {
    manifestVersion: '2',
    id: 'com.flex.anomaly-alerts',
    name: 'Anomaly Alerts',
    version: '1.0.0',
    entry: 'index.js',
    description: 'Raise alert workflow actions from Flex anomaly events.',
    iconUrl: '/assets/anomaly-alerts.svg',
    category: 'notifications',
    hostRequirements: { minSdkVersion: '1.0.0' },
    ui: { slots: ['sidebar'], width: 280, height: 360 },
    permissions: ['ui:render', 'event:emit', 'event:listen', 'network:fetch'],
    capabilities: { eventSources: ['flex:anomaly:created'] },
  },
  {
    manifestVersion: '2',
    id: 'com.flex.snowflake-export',
    name: 'Snowflake Export',
    version: '1.0.3',
    entry: 'index.js',
    description: 'Export chargeback and usage datasets for warehouse analytics.',
    iconUrl: '/assets/snowflake-export.svg',
    category: 'analytics',
    hostRequirements: { minSdkVersion: '1.0.0' },
    ui: { slots: ['main-panel', 'toolbar'], width: 420, height: 460 },
    permissions: ['storage:read', 'ui:render', 'event:listen', 'network:fetch'],
    capabilities: { exportFormats: ['json', 'csv'] },
  },
];

const plugins = new Map();
const installationsByApp = new Map();

function compareSemver(a, b) {
  const aa = String(a).split('.').map((part) => Number(part) || 0);
  const bb = String(b).split('.').map((part) => Number(part) || 0);
  for (let i = 0; i < Math.max(aa.length, bb.length); i += 1) {
    const diff = (aa[i] ?? 0) - (bb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function publishManifest(manifest, vendorId = 'flex') {
  const release = {
    id: `${manifest.id}@${manifest.version}`,
    pluginId: manifest.id,
    version: manifest.version,
    downloadUrl: `memory://${manifest.id}/${manifest.version}.zip`,
    checksum: `memory-sha256-${manifest.id}-${manifest.version}`,
    manifestJson: manifest,
    createdAt: now(),
  };
  const existing = plugins.get(manifest.id);
  const versions = [...(existing?.versions ?? []).filter((v) => v.version !== manifest.version), release].sort(
    (a, b) => compareSemver(a.version, b.version)
  );
  const latest = versions[versions.length - 1];
  plugins.set(manifest.id, {
    id: manifest.id,
    name: manifest.name,
    vendorId: existing?.vendorId ?? vendorId,
    latestVersion: latest.version,
    description: manifest.description ?? '',
    iconUrl: manifest.iconUrl,
    category: manifest.category,
    versions,
  });
}

seedManifests.forEach((manifest) => publishManifest(manifest));

function installationMap(appId) {
  const existing = installationsByApp.get(appId);
  if (existing) return existing;
  const created = new Map();
  installationsByApp.set(appId, created);
  return created;
}

function publicPlugin(plugin) {
  return {
    id: plugin.id,
    name: plugin.name,
    vendorId: plugin.vendorId,
    latestVersion: plugin.latestVersion,
    description: plugin.description,
    iconUrl: plugin.iconUrl,
    category: plugin.category,
  };
}

export function searchMarketplacePlugins({ q, category } = {}) {
  const query = String(q ?? '').trim().toLowerCase();
  return [...plugins.values()]
    .filter((plugin) => {
      const matchesQuery =
        !query ||
        plugin.id.toLowerCase().includes(query) ||
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query);
      const matchesCategory = !category || plugin.category === category;
      return matchesQuery && matchesCategory;
    })
    .map(publicPlugin);
}

export function getMarketplacePluginVersions(pluginId) {
  const plugin = plugins.get(pluginId);
  if (!plugin) return null;
  return plugin.versions.map((version) => ({ ...version }));
}

export function listAppInstallations(appId) {
  return [...installationMap(appId).values()];
}

export function installMarketplacePlugin(appId, pluginId, requestedVersion) {
  const plugin = plugins.get(pluginId);
  if (!plugin) {
    return { ok: false, status: 404, error: 'Plugin not found' };
  }
  const version = requestedVersion || plugin.latestVersion;
  const release = plugin.versions.find((candidate) => candidate.version === version);
  if (!release) {
    return { ok: false, status: 404, error: 'Plugin version not found' };
  }

  const installed = {
    appId,
    pluginId,
    version: release.version,
    installedAt: now(),
    enabled: false,
    settingsJson: {},
    manifestJson: release.manifestJson,
  };
  installationMap(appId).set(pluginId, installed);
  return { ok: true, installation: installed };
}

export function uninstallMarketplacePlugin(appId, pluginId) {
  const appInstalls = installationMap(appId);
  if (!appInstalls.has(pluginId)) {
    return { ok: false, status: 404, error: 'Installation not found' };
  }
  appInstalls.delete(pluginId);
  return { ok: true };
}
