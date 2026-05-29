import * as React from 'react';
export const FLEX_PLUGIN_CHANNEL = 'flex-plugin-api';
export const PLUGIN_API_VERSION = '1.0.0';
const PARTNER_PLUGIN_CATALOG = [
    {
        id: 'flex.chargeback',
        name: 'Chargeback',
        description: 'Team showback and cost views.',
        allowedApps: ['eztrac'],
    },
    {
        id: 'flex.resources',
        name: 'Resources',
        description: 'Allocation and capacity datasets.',
        allowedApps: ['rpt'],
    },
    {
        id: 'flex.partner.eztrac',
        name: 'EzTrac Contract',
        description: 'Partner contract for EzTrac requests to Flex.',
        allowedApps: ['eztrac'],
    },
    {
        id: 'flex.partner.dhub-rpt',
        name: 'RPT Contract',
        description: 'Partner contract for RPT requests to Flex.',
        allowedApps: ['rpt'],
    },
];
function getInstallKey(appId) {
    return `flex_partner_installed_plugins_v1:${appId}`;
}
function readInstalled(appId) {
    if (typeof window === 'undefined')
        return [];
    try {
        const raw = localStorage.getItem(getInstallKey(appId));
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function writeInstalled(appId, pluginIds) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem(getInstallKey(appId), JSON.stringify(Array.from(new Set(pluginIds))));
}
function mapSourceApp(appId) {
    return appId === 'eztrac' ? 'eztrac' : 'dhub-rpt';
}
/** True when REST mode is configured (`''` is valid — same-origin Vite proxy to flex-api). */
function hasConfiguredApiUrl(options) {
    return typeof options.apiUrl === 'string';
}
function resolveApiUrl(options) {
    if (typeof options.apiUrl === 'string')
        return options.apiUrl;
    const fromEnv = typeof process !== 'undefined' ? process.env.FLEX_API_URL : undefined;
    return typeof fromEnv === 'string' && fromEnv.trim() ? fromEnv : undefined;
}
function assertPluginAvailableForApp(appId, pluginId) {
    const inCatalog = PARTNER_PLUGIN_CATALOG.find((p) => p.id === pluginId && p.allowedApps.includes(appId));
    if (!inCatalog) {
        throw new Error(`Plugin ${pluginId} is not available for app ${appId}`);
    }
    const installed = readInstalled(appId);
    if (!installed.includes(pluginId)) {
        throw new Error(`Plugin ${pluginId} is not installed in app ${appId}`);
    }
}
function broadcastRequest(method, payload, timeoutMs) {
    return new Promise((resolve, reject) => {
        const bc = new BroadcastChannel(FLEX_PLUGIN_CHANNEL);
        const id = `fpsdk-bc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const onMsg = (ev) => {
            const data = ev.data;
            if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id)
                return;
            bc.removeEventListener('message', onMsg);
            bc.close();
            if (data.ok)
                resolve(data.result);
            else
                reject(new Error(data.error ?? 'Flex plugin request failed'));
        };
        bc.addEventListener('message', onMsg);
        bc.postMessage({ channel: FLEX_PLUGIN_CHANNEL, id, method, payload });
        setTimeout(() => {
            bc.removeEventListener('message', onMsg);
            bc.close();
            reject(new Error('flex-plugin-sdk: Flex not reachable via BroadcastChannel — is Flex tab open?'));
        }, timeoutMs);
    });
}
async function restRequest(method, payload, apiUrl) {
    const path = method === 'catalog' ? '/api/v1/catalog' : method === 'consume' ? '/api/v1/consume' : '/api/v1/produce';
    const res = await fetch(`${apiUrl}${path}`, {
        method: method === 'catalog' ? 'GET' : 'POST',
        headers: method === 'catalog' ? undefined : { 'Content-Type': 'application/json' },
        body: method === 'catalog' ? undefined : JSON.stringify(payload),
    });
    const json = (await res.json());
    if (!res.ok)
        throw new Error(json.error ?? `Flex API ${res.status}`);
    return json;
}
function request(method, payload, options) {
    const apiUrl = resolveApiUrl(options);
    if (apiUrl !== undefined) {
        return restRequest(method, payload, apiUrl);
    }
    const caller = typeof window !== 'undefined' ? window : undefined;
    if (!caller) {
        return Promise.reject(new Error('flex-plugin-sdk: use apiUrl for Node/VS Code or open in browser with Flex tab'));
    }
    const target = options.target;
    const localApi = caller.FlexPlugins;
    /** Same tab/window as Flex — call API directly */
    if (!target && localApi) {
        if (method === 'catalog')
            return Promise.resolve(localApi.catalog());
        if (method === 'consume' && payload) {
            return Promise.resolve(localApi.consume(payload));
        }
        if (method === 'produce' && payload) {
            return Promise.resolve(localApi.produce(payload));
        }
    }
    /** Another tab — BroadcastChannel (same origin, Flex tab open) */
    const useBroadcast = options.useBroadcast !== false;
    if (!target && useBroadcast && typeof BroadcastChannel !== 'undefined') {
        return broadcastRequest(method, payload, options.timeoutMs ?? 10000);
    }
    if (!target) {
        return Promise.reject(new Error('flex-plugin-sdk: Open Flex in another tab (same browser) or pass options.target = flexWindow.'));
    }
    /** Same-origin: optional direct call on target without postMessage */
    try {
        const targetApi = target.FlexPlugins;
        if (targetApi) {
            if (method === 'catalog')
                return Promise.resolve(targetApi.catalog());
            if (method === 'consume' && payload) {
                return Promise.resolve(targetApi.consume(payload));
            }
            if (method === 'produce' && payload) {
                return Promise.resolve(targetApi.produce(payload));
            }
        }
    }
    catch {
        /* cross-origin — fall through to postMessage */
    }
    return new Promise((resolve, reject) => {
        const id = `fpsdk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const timeout = options.timeoutMs ?? 10000;
        const handler = (event) => {
            const data = event.data;
            if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id)
                return;
            caller.removeEventListener('message', handler);
            if (data.ok)
                resolve(data.result);
            else
                reject(new Error(data.error ?? 'Flex plugin request failed'));
        };
        caller.addEventListener('message', handler);
        target.postMessage({ channel: FLEX_PLUGIN_CHANNEL, id, method, payload }, '*');
        setTimeout(() => {
            caller.removeEventListener('message', handler);
            reject(new Error('flex-plugin-sdk: bridge timeout — is Flex open, same browser profile, and extensions enabled?'));
        }, timeout);
    });
}
/** Client for Flex plugin API — use in partner apps, scripts, or extension pages */
export class FlexPluginClient {
    constructor(options = {}) {
        this.options = options;
    }
    catalog() {
        return request('catalog', undefined, this.options);
    }
    consume(req) {
        return request('consume', req, this.options);
    }
    produce(req) {
        return request('produce', req, this.options);
    }
}
export class PartnerPluginClient {
    constructor(appId, base = new FlexPluginClient(), options = {}) {
        this.appId = appId;
        this.base = base;
        this.options = options;
    }
    pluginCatalog() {
        return PARTNER_PLUGIN_CATALOG.filter((p) => p.allowedApps.includes(this.appId));
    }
    catalog() {
        return this.base.catalog();
    }
    listInstalledPlugins() {
        return readInstalled(this.appId);
    }
    getApiUrl() {
        if (!hasConfiguredApiUrl(this.options)) {
            throw new Error('Partner marketplace actions require apiUrl — is flex-api running? (npm run api)');
        }
        return this.options.apiUrl;
    }
    async listPublishedPlugins() {
        const apiUrl = this.getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/partner-marketplace?app=${this.appId}`);
        if (!res.ok)
            throw new Error(`Marketplace fetch failed (${res.status})`);
        return (await res.json());
    }
    async listInstalledPluginsRemote() {
        const apiUrl = this.getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/partner-marketplace/installed?app=${this.appId}`);
        if (!res.ok)
            throw new Error(`Installed plugins fetch failed (${res.status})`);
        return (await res.json());
    }
    installPlugin(pluginId) {
        const allowed = this.pluginCatalog().some((p) => p.id === pluginId);
        if (!allowed) {
            throw new Error(`Plugin ${pluginId} cannot be installed in ${this.appId}`);
        }
        const next = Array.from(new Set([...readInstalled(this.appId), pluginId]));
        writeInstalled(this.appId, next);
        return next;
    }
    uninstallPlugin(pluginId) {
        const next = readInstalled(this.appId).filter((id) => id !== pluginId);
        writeInstalled(this.appId, next);
        return next;
    }
    async installPublishedPlugin(pluginId) {
        const apiUrl = this.getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/partner-marketplace/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app: this.appId, pluginId }),
        });
        const out = (await res.json());
        if (!res.ok || out.ok === false)
            throw new Error(out.error ?? 'Install failed');
        const installed = out.installed ?? (await this.listInstalledPluginsRemote());
        writeInstalled(this.appId, installed);
        return installed;
    }
    async uninstallPublishedPlugin(pluginId) {
        const apiUrl = this.getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/partner-marketplace/uninstall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app: this.appId, pluginId }),
        });
        const out = (await res.json());
        if (!res.ok || out.ok === false)
            throw new Error(out.error ?? 'Uninstall failed');
        const installed = out.installed ?? (await this.listInstalledPluginsRemote());
        writeInstalled(this.appId, installed);
        return installed;
    }
    async assertInstalled(pluginId) {
        if (hasConfiguredApiUrl(this.options)) {
            let installed = await this.listInstalledPluginsRemote();
            if (!installed.includes(pluginId)) {
                const published = await this.listPublishedPlugins();
                if (published.some((p) => p.pluginId === pluginId)) {
                    installed = await this.installPublishedPlugin(pluginId);
                }
            }
            if (!installed.includes(pluginId)) {
                throw new Error(`Plugin ${pluginId} is not installed in ${this.appId}. Install it in the marketplace first.`);
            }
            writeInstalled(this.appId, installed);
            return;
        }
        assertPluginAvailableForApp(this.appId, pluginId);
    }
    async assertPublishedOrBuiltIn(pluginId) {
        const builtIn = this.pluginCatalog().some((p) => p.id === pluginId);
        if (builtIn)
            return;
        if (hasConfiguredApiUrl(this.options)) {
            const published = await this.listPublishedPlugins();
            if (published.some((p) => p.pluginId === pluginId))
                return;
        }
        throw new Error(`Plugin ${pluginId} is not available for app ${this.appId}`);
    }
    async consume(req) {
        await this.assertPublishedOrBuiltIn(req.pluginId);
        await this.assertInstalled(req.pluginId);
        return this.base.consume(req);
    }
    async produce(req) {
        await this.assertPublishedOrBuiltIn(req.pluginId);
        await this.assertInstalled(req.pluginId);
        const destination = req.destinationApp ?? 'flex';
        if (destination !== 'flex') {
            throw new Error('Plugins may only send data to flex');
        }
        return this.base.produce({
            ...req,
            sourceApp: req.sourceApp ?? mapSourceApp(this.appId),
            destinationApp: 'flex',
        });
    }
}
export function createFlexPluginClient(options) {
    return new FlexPluginClient(options);
}
export function createPartnerPluginClient(appId, options) {
    return new PartnerPluginClient(appId, new FlexPluginClient(options), options ?? {});
}
/** Known plugin IDs */
export const FlexPluginIds = {
    dashboard: 'flex.dashboard',
    governance: 'flex.governance',
    settings: 'flex.settings',
    cloudUsage: 'flex.cloud-usage',
    optimization: 'flex.optimization',
    anomalies: 'flex.anomalies',
    chargeback: 'flex.chargeback',
    workforce: 'flex.workforce',
    resources: 'flex.resources',
    alignment: 'flex.alignment',
    integrations: 'flex.integrations',
    partnerEzTrac: 'flex.partner.eztrac',
    partnerDhubRpt: 'flex.partner.dhub-rpt',
    assistant: 'flex.assistant',
    extension: 'flex.extension',
    /** Installed from Extensions marketplace */
    pagerduty: 'flex.ext.pagerduty',
    teams: 'flex.ext.teams',
    snowflake: 'flex.ext.snowflake',
    jira: 'flex.ext.jira',
};
function permissionRoot(permission) {
    return permission.split(':', 1)[0];
}
function hasPermission(permissions, permission) {
    if (!permissions?.length)
        return true;
    const root = permissionRoot(permission);
    return permissions.some((candidate) => candidate === permission ||
        candidate === root ||
        candidate === `${root}:*` ||
        permission.startsWith(`${candidate}:`));
}
function stableId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function compareSemver(a, b) {
    const aa = a.split('.').map((part) => Number(part) || 0);
    const bb = b.split('.').map((part) => Number(part) || 0);
    for (let i = 0; i < Math.max(aa.length, bb.length); i += 1) {
        const diff = (aa[i] ?? 0) - (bb[i] ?? 0);
        if (diff !== 0)
            return diff;
    }
    return 0;
}
export class MemoryPluginRegistry {
    constructor(seedPlugins = []) {
        this.plugins = new Map();
        this.installsByApp = new Map();
        seedPlugins.forEach((manifest) => {
            this.publish(manifest, {
                vendorId: manifest.vendorId,
                downloadUrl: manifest.downloadUrl,
                checksum: manifest.checksum,
            });
        });
    }
    publish(manifest, meta = {}) {
        const version = {
            id: `${manifest.id}@${manifest.version}`,
            pluginId: manifest.id,
            version: manifest.version,
            downloadUrl: meta.downloadUrl ?? `memory://${manifest.id}/${manifest.version}.zip`,
            checksum: meta.checksum ?? `memory-sha256-${manifest.id}-${manifest.version}`,
            manifest,
            createdAt: new Date().toISOString(),
        };
        const existing = this.plugins.get(manifest.id);
        const versions = [...(existing?.versions ?? []).filter((v) => v.version !== manifest.version), version].sort((a, b) => compareSemver(a.version, b.version));
        const latest = versions[versions.length - 1];
        this.plugins.set(manifest.id, {
            id: manifest.id,
            name: manifest.name,
            vendorId: meta.vendorId ?? existing?.vendorId ?? 'local',
            latestVersion: latest.version,
            description: manifest.description ?? existing?.description ?? '',
            iconUrl: manifest.iconUrl ?? existing?.iconUrl,
            category: manifest.category ?? existing?.category,
            versions,
        });
        return version;
    }
    async search(params = {}) {
        const q = params.q?.trim().toLowerCase();
        return [...this.plugins.values()].filter((plugin) => {
            const matchesQuery = !q ||
                plugin.name.toLowerCase().includes(q) ||
                plugin.description.toLowerCase().includes(q) ||
                plugin.id.toLowerCase().includes(q);
            const matchesCategory = !params.category || plugin.category === params.category;
            return matchesQuery && matchesCategory;
        });
    }
    async versions(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin)
            throw new Error(`Unknown plugin: ${pluginId}`);
        return [...plugin.versions];
    }
    async install(appId, pluginId, version) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin)
            throw new Error(`Unknown plugin: ${pluginId}`);
        const release = plugin.versions.find((candidate) => candidate.version === (version ?? plugin.latestVersion)) ??
            plugin.versions[plugin.versions.length - 1];
        if (!release)
            throw new Error(`Plugin ${pluginId} has no versions`);
        const byPlugin = this.installsByApp.get(appId) ?? new Map();
        const installation = {
            appId,
            pluginId,
            version: release.version,
            installedAt: new Date().toISOString(),
            enabled: false,
            settings: {},
            manifest: release.manifest,
            state: 'installed',
        };
        byPlugin.set(pluginId, installation);
        this.installsByApp.set(appId, byPlugin);
        return installation;
    }
    async uninstall(appId, pluginId) {
        this.installsByApp.get(appId)?.delete(pluginId);
    }
    async installations(appId) {
        return [...(this.installsByApp.get(appId)?.values() ?? [])];
    }
}
export class PluginHost {
    constructor(options) {
        this.options = options;
        this.requestHandlers = new Map();
        this.installationsByPlugin = new Map();
        this.slots = new Map();
        this.events = new Map();
        this.eventSubscriptionsByPlugin = new Map();
        this.storageByPlugin = new Map();
        this.subscribers = new Set();
        this.appId = options.appId;
        this.registryUrl = options.registryUrl;
        this.sandbox = options.sandbox ?? 'iframe';
        this.registry = options.registry ?? new MemoryPluginRegistry();
        Object.entries(options.requestHandlers ?? {}).forEach(([action, handler]) => {
            this.registerRequestHandler(action, handler);
        });
    }
    subscribe(listener) {
        this.subscribers.add(listener);
        return () => this.subscribers.delete(listener);
    }
    getSnapshot() {
        return [...this.installationsByPlugin.values()];
    }
    async searchMarketplace(params) {
        return this.registry.search(params);
    }
    async getVersions(pluginId) {
        return this.registry.versions(pluginId);
    }
    async syncInstallations() {
        const rows = await this.registry.installations(this.appId);
        this.installationsByPlugin = new Map(rows.map((row) => [row.pluginId, row]));
        this.notify();
        return rows;
    }
    async install(pluginId, version) {
        const installation = await this.registry.install(this.appId, pluginId, version);
        this.validateManifest(installation.manifest);
        this.installationsByPlugin.set(pluginId, installation);
        this.notify();
        return installation;
    }
    async enable(pluginId) {
        const installation = this.requireInstallation(pluginId);
        const enabled = { ...installation, enabled: true, state: 'enabled' };
        this.installationsByPlugin.set(pluginId, enabled);
        this.notify();
        return enabled;
    }
    async disable(pluginId) {
        const installation = this.requireInstallation(pluginId);
        this.unregisterPluginSlots(pluginId);
        this.unsubscribePluginEvents(pluginId);
        const disabled = { ...installation, enabled: false, state: 'disabled' };
        this.installationsByPlugin.set(pluginId, disabled);
        this.notify();
        return disabled;
    }
    async uninstall(pluginId) {
        if (this.installationsByPlugin.has(pluginId)) {
            await this.disable(pluginId);
        }
        this.storageByPlugin.delete(pluginId);
        this.installationsByPlugin.delete(pluginId);
        await this.registry.uninstall(this.appId, pluginId);
        this.notify();
    }
    getInstallation(pluginId) {
        return this.installationsByPlugin.get(pluginId);
    }
    registerRequestHandler(action, handler) {
        this.requestHandlers.set(action, handler);
        return () => this.requestHandlers.delete(action);
    }
    registerSlot(slot, component, pluginId = 'host') {
        if (pluginId !== 'host')
            this.assertPluginPermission(pluginId, 'ui:render');
        const current = this.slots.get(slot) ?? [];
        const registration = { id: stableId(`slot-${slot}`), pluginId, component };
        this.slots.set(slot, [...current, registration]);
        this.notify();
        return () => {
            this.slots.set(slot, (this.slots.get(slot) ?? []).filter((row) => row.id !== registration.id));
            this.notify();
        };
    }
    getSlotComponents(slot) {
        return [...(this.slots.get(slot) ?? [])];
    }
    getBridge(pluginId) {
        return {
            emit: (event, payload) => this.emit(pluginId, event, payload),
            on: (event, handler) => this.on(pluginId, event, handler),
            request: (action, params) => this.request(pluginId, action, params),
            ui: {
                registerSlotComponent: (slot, component) => this.registerSlot(slot, component, pluginId),
                showModal: (content) => {
                    this.assertPluginPermission(pluginId, 'ui:render');
                    this.options.onModal?.(content, pluginId);
                },
                showToast: (message) => {
                    this.assertPluginPermission(pluginId, 'ui:render');
                    this.options.onToast?.(message, pluginId);
                },
            },
            storage: {
                get: async (key) => {
                    this.assertPluginPermission(pluginId, 'storage:read');
                    return this.storageByPlugin.get(pluginId)?.get(key);
                },
                set: async (key, value) => {
                    this.assertPluginPermission(pluginId, 'storage:write');
                    const storage = this.storageByPlugin.get(pluginId) ?? new Map();
                    storage.set(key, value);
                    this.storageByPlugin.set(pluginId, storage);
                },
            },
            fetch: (url, options) => {
                this.assertPluginPermission(pluginId, 'network:fetch');
                return this.options.fetchProxy ? this.options.fetchProxy(url, options, pluginId) : fetch(url, options);
            },
        };
    }
    emit(pluginId, event, payload) {
        if (pluginId !== 'host')
            this.assertPluginPermission(pluginId, 'event:emit');
        this.events.get(event)?.forEach((handler) => handler(payload));
    }
    on(pluginId, event, handler) {
        if (pluginId !== 'host')
            this.assertPluginPermission(pluginId, 'event:listen');
        const handlers = this.events.get(event) ?? new Set();
        handlers.add(handler);
        this.events.set(event, handlers);
        const pluginSubscriptions = this.eventSubscriptionsByPlugin.get(pluginId) ?? [];
        pluginSubscriptions.push({ event, handler });
        this.eventSubscriptionsByPlugin.set(pluginId, pluginSubscriptions);
        return () => {
            handlers.delete(handler);
            this.eventSubscriptionsByPlugin.set(pluginId, (this.eventSubscriptionsByPlugin.get(pluginId) ?? []).filter((row) => row.handler !== handler));
        };
    }
    async request(pluginId, action, params) {
        if (pluginId !== 'host')
            this.assertPluginPermission(pluginId, action);
        const handler = this.requestHandlers.get(action);
        if (!handler)
            throw new Error(`Host action not registered: ${action}`);
        return handler(params, pluginId);
    }
    validateManifest(manifest) {
        if (manifest.hostRequirements?.minSdkVersion) {
            const needed = manifest.hostRequirements.minSdkVersion;
            if (compareSemver(PLUGIN_API_VERSION, needed) < 0) {
                throw new Error(`${manifest.id} requires plugin SDK ${needed}+`);
            }
        }
        for (const permission of manifest.permissions ?? []) {
            if (!hasPermission(this.options.permissions, permission)) {
                throw new Error(`${manifest.id} requested unsupported permission: ${permission}`);
            }
        }
    }
    requireInstallation(pluginId) {
        const installation = this.installationsByPlugin.get(pluginId);
        if (!installation || installation.state === 'uninstalled') {
            throw new Error(`Plugin is not installed: ${pluginId}`);
        }
        return installation;
    }
    assertPluginPermission(pluginId, permission) {
        const installation = this.requireInstallation(pluginId);
        if (!installation.enabled && installation.state !== 'enabled') {
            throw new Error(`Plugin is not enabled: ${pluginId}`);
        }
        if (!hasPermission(installation.manifest.permissions, permission)) {
            throw new Error(`${pluginId} is missing permission: ${permission}`);
        }
    }
    unregisterPluginSlots(pluginId) {
        for (const [slot, registrations] of this.slots.entries()) {
            this.slots.set(slot, registrations.filter((row) => row.pluginId !== pluginId));
        }
    }
    unsubscribePluginEvents(pluginId) {
        for (const { event, handler } of this.eventSubscriptionsByPlugin.get(pluginId) ?? []) {
            this.events.get(event)?.delete(handler);
        }
        this.eventSubscriptionsByPlugin.delete(pluginId);
    }
    notify() {
        this.subscribers.forEach((listener) => listener());
    }
}
const PluginHostContext = React.createContext(null);
export function PluginProvider({ host, config, children, }) {
    const ref = React.useRef(host ?? null);
    if (!ref.current) {
        if (!config)
            throw new Error('PluginProvider requires host or config');
        ref.current = new PluginHost(config);
    }
    return React.createElement(PluginHostContext.Provider, { value: ref.current }, children);
}
export function usePluginHost() {
    const host = React.useContext(PluginHostContext);
    if (!host)
        throw new Error('usePluginHost must be used inside PluginProvider');
    return host;
}
export function usePluginManager() {
    return usePluginHost();
}
class SlotErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { failed: false };
    }
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}
export function Slot({ name, fallback = null }) {
    const host = usePluginHost();
    const subscribe = React.useCallback((listener) => host.subscribe(listener), [host]);
    const getSnapshot = React.useCallback(() => host.getSlotComponents(name), [host, name]);
    const registrations = React.useSyncExternalStore(subscribe, getSnapshot, () => []);
    if (registrations.length === 0)
        return React.createElement(React.Fragment, null, fallback);
    return React.createElement(React.Fragment, null, registrations.map((registration) => React.createElement(SlotErrorBoundary, { key: registration.id }, registration.component)));
}
export function createPluginHost(options) {
    return new PluginHost(options);
}
