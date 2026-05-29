import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  GitCompareArrows,
  LayoutDashboard,
  Link2,
  PiggyBank,
  Send,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { alignmentScore } from '../data/alignment';
import { isFeatureRouteEnabled } from './featurePlugins';
import { pluginIdForPath } from '../plugins/marketplace/routeRegistry';

export type IntentKind = 'navigate' | 'ai' | 'action';

export interface PaletteItem {
  id: string;
  kind: IntentKind;
  label: string;
  description: string;
  icon: LucideIcon;
  route?: string;
  pluginId?: string;
  aiQuery?: string;
  actionType?: 'approve_first' | 'publish_anomaly_feed' | 'resolve_critical';
  keywords: string[];
}

function paletteItemEnabled(item: PaletteItem): boolean {
  if (!item.route) return true;
  const pid = item.pluginId ?? pluginIdForPath(item.route);
  if (!pid) return isFeatureRouteEnabled(item.route);
  return isFeatureRouteEnabled(item.route);
}

const PAGE_ITEMS: PaletteItem[] = [
  {
    id: 'dash',
    kind: 'navigate',
    label: 'Dashboard',
    description: 'KPIs and overview',
    icon: LayoutDashboard,
    route: '/',
    pluginId: 'flex.dashboard',
    keywords: ['dashboard', 'home', 'overview', 'kpi'],
  },
  {
    id: 'align',
    kind: 'navigate',
    label: 'Governance hub',
    description: 'Approvals, partners, alignment',
    icon: ArrowLeftRight,
    route: '/govern/exchange',
    pluginId: 'flex.governance',
    keywords: ['governance', 'exchange', 'approval', 'publish', 'integrations', 'alignment'],
  },
  {
    id: 'cloud',
    kind: 'navigate',
    label: 'Cloud Usage',
    description: 'Spend breakdown and forecast',
    icon: Zap,
    route: '/cloud',
    pluginId: 'flex.cloud-usage',
    keywords: ['cloud', 'usage', 'spend', 'forecast', 'budget'],
  },
  {
    id: 'opt',
    kind: 'navigate',
    label: 'Cost Optimization',
    description: 'Savings lifecycle tracker',
    icon: PiggyBank,
    route: '/optimization',
    pluginId: 'flex.optimization',
    keywords: ['optimization', 'savings', 'rightsizing', 'cost cut', 'lifecycle'],
  },
  {
    id: 'cb',
    kind: 'navigate',
    label: 'Chargeback & Showback',
    description: 'Team spend, budget, tags',
    icon: Zap,
    route: '/chargeback',
    pluginId: 'flex.chargeback',
    keywords: ['chargeback', 'showback', 'team spend', 'cost center'],
  },
  {
    id: 'wf',
    kind: 'navigate',
    label: 'Workforce × Infrastructure',
    description: 'Squad capacity and hiring signals',
    icon: Zap,
    route: '/workforce',
    pluginId: 'flex.workforce',
    keywords: ['workforce', 'hr', 'squad', 'hiring', 'headcount'],
  },
  {
    id: 'anom',
    kind: 'navigate',
    label: 'Anomalies',
    description: 'Open and resolved incidents',
    icon: AlertTriangle,
    route: '/anomalies',
    pluginId: 'flex.anomalies',
    keywords: ['anomaly', 'anomalies', 'alert', 'incident', 'spike'],
  },
  {
    id: 'ex',
    kind: 'navigate',
    label: 'Data Exchange',
    description: 'Approvals and publishing',
    icon: ArrowLeftRight,
    route: '/govern/exchange',
    pluginId: 'flex.governance',
    keywords: ['exchange', 'approve', 'pending', 'transfer', 'publish'],
  },
  {
    id: 'int',
    kind: 'navigate',
    label: 'Integrations',
    description: 'EzTrac and dhub-rpt sync',
    icon: Link2,
    route: '/govern/partners',
    pluginId: 'flex.integrations',
    keywords: ['integration', 'sync', 'eztrac', 'dhub', 'partner'],
  },
  {
    id: 'ai',
    kind: 'navigate',
    label: 'Flex AI',
    description: 'Open assistant',
    icon: Sparkles,
    route: '/assistant',
    pluginId: 'flex.assistant',
    keywords: ['ai', 'assistant', 'chat', 'ask'],
  },
];

const INTENT_ITEMS: PaletteItem[] = [
  {
    id: 'ai-spend',
    kind: 'ai',
    label: 'Why is spend changing?',
    description: 'Ask Flex AI with live KPI context',
    icon: Sparkles,
    route: '/assistant',
    pluginId: 'flex.assistant',
    aiQuery: 'Why is cloud spend changing this month? Break down drivers and anomalies.',
    keywords: ['why spend', 'spend up', 'spend down', 'variance', 'why is spend'],
  },
  {
    id: 'ai-alignment',
    kind: 'ai',
    label: 'Explain alignment conflicts',
    description: 'Cross-app drift analysis',
    icon: GitCompareArrows,
    route: '/assistant',
    pluginId: 'flex.assistant',
    aiQuery: 'What alignment conflicts exist between Flex, EzTrac, and dhub-rpt?',
    keywords: ['explain conflict', 'alignment issue', 'why drift', 'cross app'],
  },
  {
    id: 'act-approve',
    kind: 'action',
    label: 'Approve next pending request',
    description: 'Review impact in Data Exchange first',
    icon: Check,
    route: '/govern/exchange',
    pluginId: 'flex.governance',
    actionType: 'approve_first',
    keywords: ['approve request', 'approve pending', 'approve eztrac', 'approve transfer'],
  },
  {
    id: 'act-publish-feed',
    kind: 'action',
    label: 'Publish anomaly_feed',
    description: 'Fix EzTrac forecasting conflict',
    icon: Send,
    route: '/govern/exchange',
    pluginId: 'flex.governance',
    actionType: 'publish_anomaly_feed',
    keywords: ['publish anomaly', 'publish feed', 'anomaly_feed'],
  },
  {
    id: 'act-resolve',
    kind: 'action',
    label: 'Resolve critical anomaly',
    description: 'Mark highest-severity open item resolved',
    icon: AlertTriangle,
    route: '/anomalies',
    pluginId: 'flex.anomalies',
    actionType: 'resolve_critical',
    keywords: ['resolve anomaly', 'fix anomaly', 'close incident', 'resolve critical'],
  },
  {
    id: 'nav-conflicts',
    kind: 'navigate',
    label: 'Show alignment conflicts',
    description: `Score ${alignmentScore}% — review drift rows`,
    icon: GitCompareArrows,
    route: '/govern/alignment',
    pluginId: 'flex.alignment',
    keywords: ['show conflicts', 'conflicts', 'alignment conflicts', 'drift rows'],
  },
  {
    id: 'nav-pending',
    kind: 'navigate',
    label: 'Show pending approvals',
    description: 'Jump to Data Exchange queue',
    icon: ArrowLeftRight,
    route: '/govern/exchange',
    pluginId: 'flex.governance',
    keywords: ['pending approvals', 'awaiting approval', 'approval queue'],
  },
];

const ALL_PALETTE_ITEMS: PaletteItem[] = [...INTENT_ITEMS, ...PAGE_ITEMS].filter(paletteItemEnabled);

export function searchPaletteItems(query: string): PaletteItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_PALETTE_ITEMS;

  const scored = ALL_PALETTE_ITEMS.map((item) => {
    let score = 0;
    if (item.label.toLowerCase().includes(q)) score += 10;
    if (item.description.toLowerCase().includes(q)) score += 5;
    for (const kw of item.keywords) {
      if (kw.includes(q) || q.includes(kw)) score += 8;
      if (q.split(/\s+/).some((w) => w.length > 2 && kw.includes(w))) score += 4;
    }
    return { item, score };
  }).filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ item }) => item);
}
