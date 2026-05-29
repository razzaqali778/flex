import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type FlexExtensionKind = 'page' | 'nav-item' | 'governance-tab' | 'hub-link' | 'search-entry';

export interface FlexExtensionBase {
  id: string;
  kind: FlexExtensionKind;
  pluginId: string;
}

export interface FlexPageExtension extends FlexExtensionBase {
  kind: 'page';
  path: string;
  loader: () => Promise<ReactNode>;
}

export interface FlexNavItemExtension extends FlexExtensionBase {
  kind: 'nav-item';
  sectionId: string;
  sectionLabel: string;
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: 'pending';
}

export interface FlexGovernanceTabExtension extends FlexExtensionBase {
  kind: 'governance-tab';
  to: string;
  label: string;
  short: string;
  description: string;
}

export interface FlexHubLinkExtension extends FlexExtensionBase {
  kind: 'hub-link';
  section: string;
  sectionDescription: string;
  to: string;
  label: string;
}

export interface FlexSearchEntryExtension extends FlexExtensionBase {
  kind: 'search-entry';
  label: string;
  route: string;
  description: string;
}

export type FlexExtension =
  | FlexPageExtension
  | FlexNavItemExtension
  | FlexGovernanceTabExtension
  | FlexHubLinkExtension
  | FlexSearchEntryExtension;

export interface FlexFrontendPluginOptions {
  pluginId: string;
  title?: string;
  extensions: FlexExtension[];
  /** Named routes for cross-plugin links (Backstage routeRef pattern, simplified) */
  routes?: Record<string, string>;
}

export interface FlexFrontendPlugin {
  pluginId: string;
  title?: string;
  extensions: FlexExtension[];
  routes: Record<string, string>;
  getExtension(id: string): FlexExtension | undefined;
}
