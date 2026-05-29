import type { NavSection } from '../../lib/navStructure.types';
import type {
  FlexFrontendPlugin,
  FlexGovernanceTabExtension,
  FlexHubLinkExtension,
  FlexNavItemExtension,
  FlexSearchEntryExtension,
} from '../frontend/types';

export function buildNavSections(features: FlexFrontendPlugin[]): NavSection[] {
  const sections = new Map<string, NavSection>();

  for (const plugin of features) {
    for (const ext of plugin.extensions) {
      if (ext.kind !== 'nav-item') continue;
      const nav = ext as FlexNavItemExtension;
      const existing = sections.get(nav.sectionId) ?? {
        id: nav.sectionId,
        label: nav.sectionLabel,
        items: [],
      };
      existing.items.push({
        to: nav.to,
        icon: nav.icon,
        label: nav.label,
        pluginId: nav.pluginId.startsWith('flex.app.') ? undefined : nav.pluginId,
        badge: nav.badge,
      });
      sections.set(nav.sectionId, existing);
    }
  }

  const order = ['overview', 'govern', 'cost', 'org', 'tools'];
  return order
    .map((id) => sections.get(id))
    .filter((s): s is NavSection => !!s && s.items.length > 0);
}

export function buildGovernanceTabs(features: FlexFrontendPlugin[]) {
  const tabs: Array<{
    to: string;
    label: string;
    short: string;
    description: string;
    pluginId: string;
  }> = [];

  for (const plugin of features) {
    for (const ext of plugin.extensions) {
      if (ext.kind !== 'governance-tab') continue;
      const tab = ext as FlexGovernanceTabExtension;
      tabs.push({
        to: tab.to,
        label: tab.label,
        short: tab.short,
        description: tab.description,
        pluginId: tab.pluginId,
      });
    }
  }

  return tabs;
}

export function buildDashboardHub(features: FlexFrontendPlugin[]) {
  const bySection = new Map<
    string,
    { section: string; description: string; links: Array<{ to: string; label: string; pluginId?: string }> }
  >();

  for (const plugin of features) {
    for (const ext of plugin.extensions) {
      if (ext.kind !== 'hub-link') continue;
      const link = ext as FlexHubLinkExtension;
      const row = bySection.get(link.section) ?? {
        section: link.section,
        description: link.sectionDescription,
        links: [],
      };
      row.links.push({
        to: link.to,
        label: link.label,
        pluginId: link.pluginId.startsWith('flex.app.') ? undefined : link.pluginId,
      });
      bySection.set(link.section, row);
    }
  }

  const order = ['Governance', 'Cloud & cost', 'Organization', 'Tools', 'Overview'];
  return order.map((name) => bySection.get(name)).filter(Boolean) as Array<{
    section: string;
    description: string;
    links: Array<{ to: string; label: string; pluginId?: string }>;
  }>;
}

export function buildSearchPages(features: FlexFrontendPlugin[]) {
  const pages: Array<{ label: string; route: string; desc: string; pluginId?: string }> = [];

  for (const plugin of features) {
    for (const ext of plugin.extensions) {
      if (ext.kind !== 'search-entry') continue;
      const entry = ext as FlexSearchEntryExtension;
      pages.push({
        label: entry.label,
        route: entry.route,
        desc: entry.description,
        pluginId: entry.pluginId.startsWith('flex.app.') ? undefined : entry.pluginId,
      });
    }
  }

  return pages;
}
