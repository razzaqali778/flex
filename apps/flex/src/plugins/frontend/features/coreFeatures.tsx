import {
  AlertTriangle,
  ArrowLeftRight,
  Cloud,
  LayoutDashboard,
  PiggyBank,
  Plug,
  Radio,
  Settings,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { createElement, type ComponentType, type ReactNode } from 'react';
import {
  createGovernanceTabExtension,
  createHubLinkExtension,
  createNavItemExtension,
  createPageExtension,
  createSearchEntryExtension,
} from '../blueprints';
import { createFlexFrontendPlugin } from '../createFrontendPlugin';

/** Named page exports (Flex pages use `export function PageName`) */
function lazyPage(
  importer: () => Promise<Record<string, ComponentType>>,
  exportName: string
): () => Promise<ReactNode> {
  return () =>
    importer().then((m) => {
      const Page = m[exportName];
      if (!Page) throw new Error(`Missing page export: ${exportName}`);
      return createElement(Page);
    });
}

/** Core UI features — mirrors existing App.tsx routes; does not replace them */
export const dashboardFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.dashboard',
  title: 'Dashboard',
  routes: { root: '/' },
  extensions: [
    createPageExtension({
      pluginId: 'flex.dashboard',
      path: '/',
      loader: lazyPage(() => import('../../../pages/Dashboard'), 'Dashboard'),
    }),
    createNavItemExtension({
      pluginId: 'flex.dashboard',
      sectionId: 'overview',
      sectionLabel: 'Overview',
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    }),
    createSearchEntryExtension({
      pluginId: 'flex.dashboard',
      label: 'Dashboard',
      route: '/',
      description: 'Overview & KPIs',
    }),
  ],
});

export const governanceFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.governance',
  title: 'Governance hub',
  routes: { root: '/govern/exchange' },
  extensions: [
    createPageExtension({
      pluginId: 'flex.governance',
      path: '/govern/exchange',
      loader: lazyPage(() => import('../../../pages/DataExchange'), 'DataExchange'),
    }),
    createNavItemExtension({
      pluginId: 'flex.governance',
      sectionId: 'govern',
      sectionLabel: 'Governance',
      to: '/govern/exchange',
      label: 'Governance hub',
      icon: ArrowLeftRight,
      badge: 'pending',
    }),
    createGovernanceTabExtension({
      pluginId: 'flex.governance',
      to: '/govern/exchange',
      label: 'Approvals & publish',
      short: 'Exchange',
      description: 'Approve inbound requests, publish datasets, audit trail',
    }),
    createHubLinkExtension({
      pluginId: 'flex.governance',
      section: 'Governance',
      sectionDescription: 'Approve data, connect partners, fix drift',
      to: '/govern/exchange',
      label: 'Approvals & publish',
    }),
    createSearchEntryExtension({
      pluginId: 'flex.governance',
      label: 'Governance · Approvals',
      route: '/govern/exchange',
      description: 'Approve & publish datasets',
    }),
  ],
});

export const integrationsFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.integrations',
  title: 'Partner apps',
  routes: { root: '/govern/partners' },
  extensions: [
    createPageExtension({
      pluginId: 'flex.integrations',
      path: '/govern/partners',
      loader: lazyPage(() => import('../../../pages/Integrations'), 'Integrations'),
    }),
    createGovernanceTabExtension({
      pluginId: 'flex.integrations',
      to: '/govern/partners',
      label: 'Partner apps',
      short: 'Partners',
      description: 'Trigger EzTrac and dhub-rpt sync requests',
    }),
    createHubLinkExtension({
      pluginId: 'flex.integrations',
      section: 'Governance',
      sectionDescription: 'Approve data, connect partners, fix drift',
      to: '/govern/partners',
      label: 'Partner apps',
    }),
    createSearchEntryExtension({
      pluginId: 'flex.integrations',
      label: 'Governance · Partners',
      route: '/govern/partners',
      description: 'EzTrac & dhub-rpt',
    }),
  ],
});

export const alignmentFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.alignment',
  title: 'Alignment',
  routes: { root: '/govern/alignment' },
  extensions: [
    createPageExtension({
      pluginId: 'flex.alignment',
      path: '/govern/alignment',
      loader: lazyPage(() => import('../../../pages/Alignment'), 'Alignment'),
    }),
    createGovernanceTabExtension({
      pluginId: 'flex.alignment',
      to: '/govern/alignment',
      label: 'Cross-app alignment',
      short: 'Alignment',
      description: 'Compare Flex vs EzTrac vs dhub-rpt',
    }),
    createHubLinkExtension({
      pluginId: 'flex.alignment',
      section: 'Governance',
      sectionDescription: 'Approve data, connect partners, fix drift',
      to: '/govern/alignment',
      label: 'Alignment',
    }),
    createSearchEntryExtension({
      pluginId: 'flex.alignment',
      label: 'Governance · Alignment',
      route: '/govern/alignment',
      description: 'Cross-app drift',
    }),
  ],
});

export const cloudUsageFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.cloud-usage',
  routes: { root: '/cloud' },
  extensions: [
    createPageExtension({ pluginId: 'flex.cloud-usage', path: '/cloud', loader: lazyPage(() => import('../../../pages/CloudUsage'), 'CloudUsage') }),
    createNavItemExtension({ pluginId: 'flex.cloud-usage', sectionId: 'cost', sectionLabel: 'Cloud & cost', to: '/cloud', label: 'Usage & forecast', icon: Cloud }),
    createHubLinkExtension({ pluginId: 'flex.cloud-usage', section: 'Cloud & cost', sectionDescription: 'Spend, savings, and incidents', to: '/cloud', label: 'Usage & forecast' }),
    createSearchEntryExtension({ pluginId: 'flex.cloud-usage', label: 'Cloud usage', route: '/cloud', description: 'Spend & forecast' }),
  ],
});

export const optimizationFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.optimization',
  routes: { root: '/optimization' },
  extensions: [
    createPageExtension({ pluginId: 'flex.optimization', path: '/optimization', loader: lazyPage(() => import('../../../pages/Optimization'), 'Optimization') }),
    createNavItemExtension({ pluginId: 'flex.optimization', sectionId: 'cost', sectionLabel: 'Cloud & cost', to: '/optimization', label: 'Savings', icon: PiggyBank }),
    createHubLinkExtension({ pluginId: 'flex.optimization', section: 'Cloud & cost', sectionDescription: 'Spend, savings, and incidents', to: '/optimization', label: 'Savings' }),
    createSearchEntryExtension({ pluginId: 'flex.optimization', label: 'Savings', route: '/optimization', description: 'Optimization lifecycle' }),
  ],
});

export const anomaliesFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.anomalies',
  routes: { root: '/anomalies' },
  extensions: [
    createPageExtension({ pluginId: 'flex.anomalies', path: '/anomalies', loader: lazyPage(() => import('../../../pages/Anomalies'), 'Anomalies') }),
    createNavItemExtension({ pluginId: 'flex.anomalies', sectionId: 'cost', sectionLabel: 'Cloud & cost', to: '/anomalies', label: 'Anomalies', icon: AlertTriangle }),
    createHubLinkExtension({ pluginId: 'flex.anomalies', section: 'Cloud & cost', sectionDescription: 'Spend, savings, and incidents', to: '/anomalies', label: 'Anomalies' }),
    createSearchEntryExtension({ pluginId: 'flex.anomalies', label: 'Anomalies', route: '/anomalies', description: 'Cost incidents' }),
  ],
});

export const chargebackFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.chargeback',
  routes: { root: '/chargeback' },
  extensions: [
    createPageExtension({ pluginId: 'flex.chargeback', path: '/chargeback', loader: lazyPage(() => import('../../../pages/Chargeback'), 'Chargeback') }),
    createNavItemExtension({ pluginId: 'flex.chargeback', sectionId: 'org', sectionLabel: 'Organization', to: '/chargeback', label: 'Chargeback', icon: Wallet }),
    createHubLinkExtension({ pluginId: 'flex.chargeback', section: 'Organization', sectionDescription: 'Teams, squads, and allocations', to: '/chargeback', label: 'Chargeback' }),
    createSearchEntryExtension({ pluginId: 'flex.chargeback', label: 'Chargeback', route: '/chargeback', description: 'Team showback' }),
  ],
});

export const workforceFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.workforce',
  routes: { root: '/workforce' },
  extensions: [
    createPageExtension({ pluginId: 'flex.workforce', path: '/workforce', loader: lazyPage(() => import('../../../pages/Workforce'), 'Workforce') }),
    createNavItemExtension({ pluginId: 'flex.workforce', sectionId: 'org', sectionLabel: 'Organization', to: '/workforce', label: 'Workforce', icon: Users }),
    createHubLinkExtension({ pluginId: 'flex.workforce', section: 'Organization', sectionDescription: 'Teams, squads, and allocations', to: '/workforce', label: 'Workforce' }),
    createSearchEntryExtension({ pluginId: 'flex.workforce', label: 'Workforce', route: '/workforce', description: 'Squad × infra' }),
  ],
});

export const resourcesFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.resources',
  routes: { root: '/resources' },
  extensions: [
    createPageExtension({ pluginId: 'flex.resources', path: '/resources', loader: lazyPage(() => import('../../../pages/Resources'), 'Resources') }),
    createNavItemExtension({ pluginId: 'flex.resources', sectionId: 'org', sectionLabel: 'Organization', to: '/resources', label: 'Resources', icon: Zap }),
    createHubLinkExtension({ pluginId: 'flex.resources', section: 'Organization', sectionDescription: 'Teams, squads, and allocations', to: '/resources', label: 'Resources' }),
    createSearchEntryExtension({ pluginId: 'flex.resources', label: 'Resources', route: '/resources', description: 'Allocations' }),
  ],
});

export const assistantFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.assistant',
  routes: { root: '/assistant' },
  extensions: [
    createPageExtension({ pluginId: 'flex.assistant', path: '/assistant', loader: lazyPage(() => import('../../../pages/AIAssistant'), 'AIAssistant') }),
    createNavItemExtension({ pluginId: 'flex.assistant', sectionId: 'tools', sectionLabel: 'Tools', to: '/assistant', label: 'Flex AI', icon: Sparkles }),
    createHubLinkExtension({ pluginId: 'flex.assistant', section: 'Tools', sectionDescription: 'AI copilot, partner APIs, and preferences', to: '/assistant', label: 'Flex AI' }),
    createSearchEntryExtension({ pluginId: 'flex.assistant', label: 'Flex AI', route: '/assistant', description: 'Ask across apps' }),
  ],
});

export const settingsFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.settings',
  routes: { root: '/settings' },
  extensions: [
    createPageExtension({ pluginId: 'flex.settings', path: '/settings', loader: lazyPage(() => import('../../../pages/Settings'), 'Settings') }),
    createNavItemExtension({ pluginId: 'flex.settings', sectionId: 'tools', sectionLabel: 'Tools', to: '/settings', label: 'Settings', icon: Settings }),
    createHubLinkExtension({ pluginId: 'flex.settings', section: 'Tools', sectionDescription: 'AI copilot, partner APIs, and preferences', to: '/settings', label: 'Settings' }),
    createSearchEntryExtension({ pluginId: 'flex.settings', label: 'Settings', route: '/settings', description: 'RBAC & demo mode' }),
  ],
});

/** App-level pages (no data plugin) */
export const pluginsPageFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.app.plugins',
  extensions: [
    createPageExtension({ pluginId: 'flex.app.plugins', path: '/plugins', loader: lazyPage(() => import('../../../pages/Plugins'), 'Plugins') }),
    createNavItemExtension({ pluginId: 'flex.app.plugins', sectionId: 'tools', sectionLabel: 'Tools', to: '/plugins', label: 'Plugins', icon: Plug }),
    createHubLinkExtension({ section: 'Tools', sectionDescription: 'AI copilot, partner APIs, and preferences', to: '/plugins', label: 'Plugins' }),
    createSearchEntryExtension({ label: 'Plugins', route: '/plugins', description: 'Plugin APIs & add-ons' }),
  ],
});

export const partnerConsoleFrontendPlugin = createFlexFrontendPlugin({
  pluginId: 'flex.app.partner',
  extensions: [
    createPageExtension({ pluginId: 'flex.app.partner', path: '/partner', loader: lazyPage(() => import('../../../pages/PartnerConsole'), 'PartnerConsole') }),
    createNavItemExtension({ pluginId: 'flex.app.partner', sectionId: 'tools', sectionLabel: 'Tools', to: '/partner', label: 'Partner console', icon: Radio }),
  ],
});

export const CORE_FRONTEND_FEATURES = [
  dashboardFrontendPlugin,
  governanceFrontendPlugin,
  integrationsFrontendPlugin,
  alignmentFrontendPlugin,
  cloudUsageFrontendPlugin,
  optimizationFrontendPlugin,
  anomaliesFrontendPlugin,
  chargebackFrontendPlugin,
  workforceFrontendPlugin,
  resourcesFrontendPlugin,
  assistantFrontendPlugin,
  settingsFrontendPlugin,
  pluginsPageFrontendPlugin,
  partnerConsoleFrontendPlugin,
];
