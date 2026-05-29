import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  FlexExtension,
  FlexGovernanceTabExtension,
  FlexHubLinkExtension,
  FlexNavItemExtension,
  FlexPageExtension,
  FlexSearchEntryExtension,
} from './types';

export function createPageExtension(params: {
  pluginId: string;
  path: string;
  loader: () => Promise<ReactNode>;
  id?: string;
}): FlexPageExtension {
  return {
    id: params.id ?? `page:${params.pluginId}`,
    kind: 'page',
    pluginId: params.pluginId,
    path: params.path,
    loader: params.loader,
  };
}

export function createNavItemExtension(params: {
  pluginId: string;
  sectionId: string;
  sectionLabel: string;
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: 'pending';
  id?: string;
}): FlexNavItemExtension {
  return {
    id: params.id ?? `nav:${params.pluginId}`,
    kind: 'nav-item',
    pluginId: params.pluginId,
    sectionId: params.sectionId,
    sectionLabel: params.sectionLabel,
    to: params.to,
    label: params.label,
    icon: params.icon,
    badge: params.badge,
  };
}

export function createGovernanceTabExtension(params: {
  pluginId: string;
  to: string;
  label: string;
  short: string;
  description: string;
  id?: string;
}): FlexGovernanceTabExtension {
  return {
    id: params.id ?? `gov-tab:${params.pluginId}`,
    kind: 'governance-tab',
    pluginId: params.pluginId,
    to: params.to,
    label: params.label,
    short: params.short,
    description: params.description,
  };
}

export function createHubLinkExtension(params: {
  pluginId?: string;
  section: string;
  sectionDescription: string;
  to: string;
  label: string;
  id?: string;
}): FlexHubLinkExtension {
  return {
    id: params.id ?? `hub:${params.to}`,
    kind: 'hub-link',
    pluginId: params.pluginId ?? 'flex.app',
    section: params.section,
    sectionDescription: params.sectionDescription,
    to: params.to,
    label: params.label,
  };
}

export function createSearchEntryExtension(params: {
  pluginId?: string;
  label: string;
  route: string;
  description: string;
  id?: string;
}): FlexSearchEntryExtension {
  return {
    id: params.id ?? `search:${params.route}`,
    kind: 'search-entry',
    pluginId: params.pluginId ?? 'flex.app',
    label: params.label,
    route: params.route,
    description: params.description,
  };
}

export function extensionNamespace(pluginId: string, ext: FlexExtension): FlexExtension {
  return { ...ext, id: `${ext.kind}:${pluginId}:${ext.id.split(':').pop()}` };
}
