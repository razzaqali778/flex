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
import type { NavSection } from './navStructure.types';

/** Fallback if plugin-derived nav is empty — preserves pre-plugin behavior */
export const LEGACY_NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard', pluginId: 'flex.dashboard' }],
  },
  {
    id: 'govern',
    label: 'Governance',
    items: [
      {
        to: '/govern/exchange',
        icon: ArrowLeftRight,
        label: 'Governance hub',
        pluginId: 'flex.governance',
        badge: 'pending',
      },
    ],
  },
  {
    id: 'cost',
    label: 'Cloud & cost',
    items: [
      { to: '/cloud', icon: Cloud, label: 'Usage & forecast', pluginId: 'flex.cloud-usage' },
      { to: '/optimization', icon: PiggyBank, label: 'Savings', pluginId: 'flex.optimization' },
      { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies', pluginId: 'flex.anomalies' },
    ],
  },
  {
    id: 'org',
    label: 'Organization',
    items: [
      { to: '/chargeback', icon: Wallet, label: 'Chargeback', pluginId: 'flex.chargeback' },
      { to: '/workforce', icon: Users, label: 'Workforce', pluginId: 'flex.workforce' },
      { to: '/resources', icon: Zap, label: 'Resources', pluginId: 'flex.resources' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { to: '/assistant', icon: Sparkles, label: 'Flex AI', pluginId: 'flex.assistant' },
      { to: '/plugins', icon: Plug, label: 'Plugins' },
      { to: '/partner', icon: Radio, label: 'Partner console' },
      { to: '/settings', icon: Settings, label: 'Settings', pluginId: 'flex.settings' },
    ],
  },
];

export const LEGACY_GOVERNANCE_TABS = [
  {
    to: '/govern/exchange',
    label: 'Approvals & publish',
    short: 'Exchange',
    description: 'Approve inbound requests, publish datasets, audit trail',
    pluginId: 'flex.governance',
  },
  {
    to: '/govern/partners',
    label: 'Partner apps',
    short: 'Partners',
    description: 'Trigger EzTrac and dhub-rpt sync requests',
    pluginId: 'flex.integrations',
  },
  {
    to: '/govern/alignment',
    label: 'Cross-app alignment',
    short: 'Alignment',
    description: 'Compare Flex vs EzTrac vs dhub-rpt',
    pluginId: 'flex.alignment',
  },
] as const;

export const LEGACY_DASHBOARD_HUB = [
  {
    section: 'Governance',
    description: 'Approve data, connect partners, fix drift',
    links: [
      { to: '/govern/exchange', label: 'Approvals & publish', pluginId: 'flex.governance' },
      { to: '/govern/partners', label: 'Partner apps', pluginId: 'flex.integrations' },
      { to: '/govern/alignment', label: 'Alignment', pluginId: 'flex.alignment' },
    ],
  },
  {
    section: 'Cloud & cost',
    description: 'Spend, savings, and incidents',
    links: [
      { to: '/cloud', label: 'Usage & forecast', pluginId: 'flex.cloud-usage' },
      { to: '/optimization', label: 'Savings', pluginId: 'flex.optimization' },
      { to: '/anomalies', label: 'Anomalies', pluginId: 'flex.anomalies' },
    ],
  },
  {
    section: 'Organization',
    description: 'Teams, squads, and allocations',
    links: [
      { to: '/chargeback', label: 'Chargeback', pluginId: 'flex.chargeback' },
      { to: '/workforce', label: 'Workforce', pluginId: 'flex.workforce' },
      { to: '/resources', label: 'Resources', pluginId: 'flex.resources' },
    ],
  },
  {
    section: 'Tools',
    description: 'AI copilot, partner APIs, and preferences',
    links: [
      { to: '/plugins', label: 'Plugins' },
      { to: '/assistant', label: 'Flex AI', pluginId: 'flex.assistant' },
      { to: '/settings', label: 'Settings', pluginId: 'flex.settings' },
    ],
  },
];

export const LEGACY_SEARCH_PAGES = [
  { label: 'Dashboard', route: '/', desc: 'Overview & KPIs', pluginId: 'flex.dashboard' },
  { label: 'Governance · Approvals', route: '/govern/exchange', desc: 'Approve & publish datasets', pluginId: 'flex.governance' },
  { label: 'Governance · Partners', route: '/govern/partners', desc: 'EzTrac & dhub-rpt', pluginId: 'flex.integrations' },
  { label: 'Governance · Alignment', route: '/govern/alignment', desc: 'Cross-app drift', pluginId: 'flex.alignment' },
  { label: 'Cloud usage', route: '/cloud', desc: 'Spend & forecast', pluginId: 'flex.cloud-usage' },
  { label: 'Savings', route: '/optimization', desc: 'Optimization lifecycle', pluginId: 'flex.optimization' },
  { label: 'Anomalies', route: '/anomalies', desc: 'Cost incidents', pluginId: 'flex.anomalies' },
  { label: 'Chargeback', route: '/chargeback', desc: 'Team showback', pluginId: 'flex.chargeback' },
  { label: 'Workforce', route: '/workforce', desc: 'Squad × infra', pluginId: 'flex.workforce' },
  { label: 'Resources', route: '/resources', desc: 'Allocations', pluginId: 'flex.resources' },
  { label: 'Flex AI', route: '/assistant', desc: 'Ask across apps', pluginId: 'flex.assistant' },
  { label: 'Plugins', route: '/plugins', desc: 'Plugin APIs & add-ons' },
  { label: 'Settings', route: '/settings', desc: 'RBAC & demo mode', pluginId: 'flex.settings' },
];
