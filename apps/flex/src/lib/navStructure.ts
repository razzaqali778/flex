import { flexApp } from '../plugins/app/createFlexApp';
import {
  LEGACY_DASHBOARD_HUB,
  LEGACY_GOVERNANCE_TABS,
  LEGACY_NAV_SECTIONS,
  LEGACY_SEARCH_PAGES,
} from './navStructure.legacy';

export type { NavItem, NavSection } from './navStructure.types';

const pluginNav = flexApp.getNavSections();
const pluginGovTabs = flexApp.getGovernanceTabs();
const pluginHub = flexApp.getDashboardHub();
const pluginSearch = flexApp.getSearchPages();

/** Sidebar — from frontend plugin extensions, with legacy fallback */
export const NAV_SECTIONS = pluginNav.length > 0 ? pluginNav : LEGACY_NAV_SECTIONS;

export const GOVERNANCE_TABS =
  pluginGovTabs.length > 0 ? pluginGovTabs : [...LEGACY_GOVERNANCE_TABS];

export const DASHBOARD_HUB = pluginHub.length > 0 ? pluginHub : LEGACY_DASHBOARD_HUB;

export const SEARCH_PAGES = pluginSearch.length > 0 ? pluginSearch : LEGACY_SEARCH_PAGES;

export function sectionForPath(pathname: string): string | null {
  if (pathname.startsWith('/govern')) return 'Governance';
  if (['/cloud', '/optimization', '/anomalies'].some((p) => pathname.startsWith(p)))
    return 'Cloud & cost';
  if (['/chargeback', '/workforce', '/resources'].some((p) => pathname.startsWith(p)))
    return 'Organization';
  if (pathname.startsWith('/assistant') || pathname.startsWith('/plugins') || pathname.startsWith('/settings'))
    return 'Tools';
  if (pathname === '/') return 'Overview';
  return null;
}
