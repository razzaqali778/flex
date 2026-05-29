import * as React from 'react';
import type { ReactNode } from 'react';
export declare const FLEX_PLUGIN_CHANNEL = "flex-plugin-api";
export declare const PLUGIN_API_VERSION = "1.0.0";
export interface PluginConsumeRequest {
    pluginId: string;
    dataset?: string;
    params?: Record<string, unknown>;
}
export interface PluginProduceRequest {
    pluginId: string;
    dataset: string;
    records: unknown[];
    sourceApp?: 'eztrac' | 'dhub-rpt';
    destinationApp?: 'flex';
    metadata?: Record<string, unknown>;
}
export interface FlexPluginClientOptions {
    /** Target window when using postMessage (e.g. Flex side panel). */
    target?: Window;
    /** Use BroadcastChannel to reach Flex in another tab (same origin). Default true when no target. */
    useBroadcast?: boolean;
    /** REST API (VS Code, Node) — default http://localhost:3847 */
    apiUrl?: string;
    timeoutMs?: number;
}
export type PartnerAppId = 'eztrac' | 'rpt';
export interface PartnerPluginDefinition {
    id: string;
    name: string;
    description: string;
    allowedApps: PartnerAppId[];
}
export interface PublishedPartnerPlugin {
    pluginId: string;
    name: string;
    version: string;
    description: string;
    targetApp: PartnerAppId;
    publisher?: string;
    icon?: string;
    category?: string;
    permissions?: string[];
    kind?: 'core' | 'extension';
    datasets?: unknown[];
    publishedAt: string;
}
/** Client for Flex plugin API — use in partner apps, scripts, or extension pages */
export declare class FlexPluginClient {
    private options;
    constructor(options?: FlexPluginClientOptions);
    catalog(): Promise<unknown[]>;
    consume(req: PluginConsumeRequest): Promise<unknown>;
    produce(req: PluginProduceRequest): Promise<unknown>;
}
export declare class PartnerPluginClient {
    private appId;
    private base;
    private options;
    constructor(appId: PartnerAppId, base?: FlexPluginClient, options?: FlexPluginClientOptions);
    pluginCatalog(): PartnerPluginDefinition[];
    catalog(): Promise<unknown[]>;
    listInstalledPlugins(): string[];
    private getApiUrl;
    listPublishedPlugins(): Promise<PublishedPartnerPlugin[]>;
    listInstalledPluginsRemote(): Promise<string[]>;
    installPlugin(pluginId: string): string[];
    uninstallPlugin(pluginId: string): string[];
    installPublishedPlugin(pluginId: string): Promise<string[]>;
    uninstallPublishedPlugin(pluginId: string): Promise<string[]>;
    private assertInstalled;
    private assertPublishedOrBuiltIn;
    consume(req: PluginConsumeRequest): Promise<unknown>;
    produce(req: PluginProduceRequest): Promise<unknown>;
}
export declare function createFlexPluginClient(options?: FlexPluginClientOptions): FlexPluginClient;
export declare function createPartnerPluginClient(appId: PartnerAppId, options?: FlexPluginClientOptions): PartnerPluginClient;
/** Known plugin IDs */
export declare const FlexPluginIds: {
    readonly dashboard: "flex.dashboard";
    readonly governance: "flex.governance";
    readonly settings: "flex.settings";
    readonly cloudUsage: "flex.cloud-usage";
    readonly optimization: "flex.optimization";
    readonly anomalies: "flex.anomalies";
    readonly chargeback: "flex.chargeback";
    readonly workforce: "flex.workforce";
    readonly resources: "flex.resources";
    readonly alignment: "flex.alignment";
    readonly integrations: "flex.integrations";
    readonly partnerEzTrac: "flex.partner.eztrac";
    readonly partnerDhubRpt: "flex.partner.dhub-rpt";
    readonly assistant: "flex.assistant";
    readonly extension: "flex.extension";
    /** Installed from Extensions marketplace */
    readonly pagerduty: "flex.ext.pagerduty";
    readonly teams: "flex.ext.teams";
    readonly snowflake: "flex.ext.snowflake";
    readonly jira: "flex.ext.jira";
};
export type PluginSandboxKind = 'iframe' | 'vm' | 'worker';
export type PluginLifecycleState = 'available' | 'pending' | 'installed' | 'enabled' | 'disabled' | 'uninstalled';
export interface PluginManifest {
    manifestVersion: string;
    id: string;
    name: string;
    version: string;
    entry: string;
    description?: string;
    iconUrl?: string;
    category?: string;
    hostRequirements?: {
        minSdkVersion?: string;
    };
    ui?: {
        slots?: string[];
        width?: number;
        height?: number;
    };
    permissions?: string[];
    capabilities?: Record<string, unknown>;
}
export interface RegistryPluginVersion {
    id: string;
    pluginId: string;
    version: string;
    downloadUrl: string;
    checksum: string;
    manifest: PluginManifest;
    createdAt: string;
}
export interface RegistryPlugin {
    id: string;
    name: string;
    vendorId: string;
    latestVersion: string;
    description: string;
    iconUrl?: string;
    category?: string;
    versions: RegistryPluginVersion[];
}
export interface PluginInstallation {
    appId: string;
    pluginId: string;
    version: string;
    installedAt: string;
    enabled: boolean;
    settings: Record<string, unknown>;
    manifest: PluginManifest;
    state: Exclude<PluginLifecycleState, 'available' | 'pending'>;
}
export interface RegistrySearchParams {
    q?: string;
    category?: string;
}
export interface PluginRegistry {
    search(params?: RegistrySearchParams): Promise<RegistryPlugin[]>;
    versions(pluginId: string): Promise<RegistryPluginVersion[]>;
    install(appId: string, pluginId: string, version?: string): Promise<PluginInstallation>;
    uninstall(appId: string, pluginId: string): Promise<void>;
    installations(appId: string): Promise<PluginInstallation[]>;
}
export interface HostBridge {
    emit(event: string, payload: unknown): void;
    on(event: string, handler: (payload: unknown) => void): () => void;
    request(action: string, params?: unknown): Promise<unknown>;
    ui: {
        registerSlotComponent(slot: string, component: ReactNode): () => void;
        showModal(content: ReactNode): void;
        showToast(message: string): void;
    };
    storage: {
        get(key: string): Promise<unknown>;
        set(key: string, value: unknown): Promise<void>;
    };
    fetch(url: string, options?: RequestInit): Promise<Response>;
}
export interface PluginHostOptions {
    appId: string;
    registryUrl?: string;
    sandbox?: PluginSandboxKind;
    permissions?: string[];
    registry?: PluginRegistry;
    requestHandlers?: Record<string, (params: unknown, pluginId: string) => unknown | Promise<unknown>>;
    onModal?: (content: ReactNode, pluginId: string) => void;
    onToast?: (message: string, pluginId: string) => void;
    fetchProxy?: (url: string, options: RequestInit | undefined, pluginId: string) => Promise<Response>;
}
interface SlotRegistration {
    id: string;
    pluginId: string;
    component: ReactNode;
}
type EventHandler = (payload: unknown) => void;
export declare class MemoryPluginRegistry implements PluginRegistry {
    private plugins;
    private installsByApp;
    constructor(seedPlugins?: Array<PluginManifest & {
        vendorId?: string;
        downloadUrl?: string;
        checksum?: string;
    }>);
    publish(manifest: PluginManifest, meta?: {
        vendorId?: string;
        downloadUrl?: string;
        checksum?: string;
    }): RegistryPluginVersion;
    search(params?: RegistrySearchParams): Promise<RegistryPlugin[]>;
    versions(pluginId: string): Promise<RegistryPluginVersion[]>;
    install(appId: string, pluginId: string, version?: string): Promise<PluginInstallation>;
    uninstall(appId: string, pluginId: string): Promise<void>;
    installations(appId: string): Promise<PluginInstallation[]>;
}
export declare class PluginHost {
    private options;
    readonly appId: string;
    readonly registryUrl?: string;
    readonly sandbox: PluginSandboxKind;
    private registry;
    private requestHandlers;
    private installationsByPlugin;
    private slots;
    private events;
    private eventSubscriptionsByPlugin;
    private storageByPlugin;
    private subscribers;
    constructor(options: PluginHostOptions);
    subscribe(listener: () => void): () => void;
    getSnapshot(): PluginInstallation[];
    searchMarketplace(params?: RegistrySearchParams): Promise<RegistryPlugin[]>;
    getVersions(pluginId: string): Promise<RegistryPluginVersion[]>;
    syncInstallations(): Promise<PluginInstallation[]>;
    install(pluginId: string, version?: string): Promise<PluginInstallation>;
    enable(pluginId: string): Promise<PluginInstallation>;
    disable(pluginId: string): Promise<PluginInstallation>;
    uninstall(pluginId: string): Promise<void>;
    getInstallation(pluginId: string): PluginInstallation | undefined;
    registerRequestHandler(action: string, handler: (params: unknown, pluginId: string) => unknown | Promise<unknown>): () => void;
    registerSlot(slot: string, component: ReactNode, pluginId?: string): () => void;
    getSlotComponents(slot: string): SlotRegistration[];
    getBridge(pluginId: string): HostBridge;
    emit(pluginId: string, event: string, payload: unknown): void;
    on(pluginId: string, event: string, handler: EventHandler): () => void;
    request(pluginId: string, action: string, params?: unknown): Promise<unknown>;
    private validateManifest;
    private requireInstallation;
    private assertPluginPermission;
    private unregisterPluginSlots;
    private unsubscribePluginEvents;
    private notify;
}
export declare function PluginProvider({ host, config, children, }: {
    host?: PluginHost;
    config?: PluginHostOptions;
    children: ReactNode;
}): React.FunctionComponentElement<React.ProviderProps<PluginHost | null>>;
export declare function usePluginHost(): PluginHost;
export declare function usePluginManager(): PluginHost;
export declare function Slot({ name, fallback }: {
    name: string;
    fallback?: ReactNode;
}): React.FunctionComponentElement<{
    children?: ReactNode | undefined;
}>;
export declare function createPluginHost(options: PluginHostOptions): PluginHost;
export {};
//# sourceMappingURL=index.d.ts.map