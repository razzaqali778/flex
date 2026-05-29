import type { FlexState } from '../store/flexTypes';
import type { AppId } from '../types';

export type PluginCategory = 'overview' | 'governance' | 'cost' | 'org' | 'tools' | 'extension';

/** Core = shipped with Flex. Extension = installed from marketplace. */
export type PluginKind = 'core' | 'extension';

export type PluginDirection = 'inbound' | 'outbound' | 'bidirectional';

export type MarketplaceCategory =
  | 'overview'
  | 'governance'
  | 'cost'
  | 'organization'
  | 'tools'
  | 'integrations'
  | 'notifications'
  | 'export'
  | 'ticketing'
  | 'analytics';

export interface PluginDataset {
  name: string;
  description: string;
  schema: string[];
  direction: PluginDirection;
}

export interface FlexPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  route: string;
  category: PluginCategory;
  kind?: PluginKind;
  publisher?: string;
  permissions?: string[];
  capabilities: {
    consume: boolean;
    produce: boolean;
    events: boolean;
  };
  datasets: PluginDataset[];
}

/** Marketplace card — installable extension (not core Flex areas). */
export interface MarketplaceListing {
  id: string;
  name: string;
  version: string;
  description: string;
  longDescription: string;
  publisher: string;
  icon: string;
  category: MarketplaceCategory;
  route?: string;
  permissions: string[];
  /** Rough install count for demo */
  installs: number;
}

export interface InstalledExtension {
  id: string;
  version: string;
  installedAt: string;
  enabled: boolean;
  /** How it was installed — like VS Code marketplace vs VSIX file */
  source?: 'marketplace' | 'package' | 'url';
  packagePath?: string;
}

/**
 * Flex extension package manifest (.flexext.json) — analogous to VS Code extension package.json.
 * The `entry` field must match a signed bundle shipped with Flex or loaded from an allowlist.
 */
export interface FlexExtensionPackage {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description: string;
  entry: string;
  engines?: { flex?: string };
  permissions?: string[];
  icon?: string;
  categories?: MarketplaceCategory[];
}

export interface PluginConsumeRequest {
  pluginId: string;
  dataset?: string;
}

export interface PluginConsumeResult {
  ok: true;
  pluginId: string;
  dataset: string;
  records: unknown[];
  meta: {
    exportedAt: string;
    recordCount: number;
    schema: string[];
  };
}

export interface PluginProduceRequest {
  pluginId: string;
  dataset: string;
  records: unknown[];
  sourceApp?: Exclude<AppId, 'flex'>;
  metadata?: Record<string, unknown>;
}

export interface PluginProduceResult {
  ok: boolean;
  pluginId: string;
  dataset: string;
  message: string;
  affectedIds?: string[];
  error?: string;
}

export interface PluginError {
  ok: false;
  error: string;
  code: 'PLUGIN_NOT_FOUND' | 'DATASET_NOT_FOUND' | 'NOT_ALLOWED' | 'VALIDATION' | 'RBAC_DENIED';
}

export type PluginApiResult<T> = T | PluginError;

export interface FlexPluginDefinition {
  manifest: FlexPluginManifest;
  consume: (state: FlexState, dataset?: string) => PluginConsumeResult | PluginError;
  produce?: (
    state: FlexState,
    request: PluginProduceRequest
  ) => PluginProduceResult | PluginError;
}

export interface PluginCatalogEntry extends FlexPluginManifest {
  kind: PluginKind;
  datasetCount: number;
}

export { PLUGIN_API_VERSION } from 'flex-plugin-sdk';
