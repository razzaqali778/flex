import type { MarketplaceListing } from '../types';

/** Marketplace add-ons only — core Flex areas are not installable extensions */
export const MARKETPLACE_CATALOG: MarketplaceListing[] = [
  {
    id: 'flex.ext.pagerduty',
    name: 'PagerDuty Alerts',
    version: '1.2.0',
    description: 'Escalate open cost anomalies to on-call when impact exceeds threshold.',
    longDescription:
      'Reads anomaly events from Flex and can trigger PagerDuty incidents. Configure severity thresholds and routing keys in produce payloads.',
    publisher: 'PagerDuty Inc.',
    icon: '🔔',
    category: 'notifications',
    route: '/plugins',
    permissions: ['Read anomalies', 'Create incidents (demo)'],
    installs: 1240,
  },
  {
    id: 'flex.ext.teams',
    name: 'Microsoft Teams',
    version: '2.0.1',
    description: 'Post approval and anomaly summaries to Teams channels.',
    longDescription:
      'Send governed notifications to Teams when approvals complete or high-severity anomalies open. Uses webhook-style produce API.',
    publisher: 'Microsoft',
    icon: '💬',
    category: 'notifications',
    route: '/plugins',
    permissions: ['Read governance events', 'Post messages (demo)'],
    installs: 2100,
  },
  {
    id: 'flex.ext.snowflake',
    name: 'Snowflake Export',
    version: '1.0.3',
    description: 'Export chargeback and usage datasets for warehouse analytics.',
    longDescription:
      'Consumes team showback and cloud usage trend, returns a manifest you can schedule for Snowflake loads (demo JSON).',
    publisher: 'Snowflake',
    icon: '❄️',
    category: 'export',
    route: '/plugins',
    permissions: ['Read chargeback', 'Read cloud usage'],
    installs: 890,
  },
  {
    id: 'flex.ext.jira',
    name: 'Jira Cost Tickets',
    version: '1.1.0',
    description: 'Create Jira issues from cost anomalies with squad and impact context.',
    longDescription:
      'Produce creates a ticket payload from anomaly records. Finance and Platform teams track remediation in Jira.',
    publisher: 'Atlassian',
    icon: '🎫',
    category: 'ticketing',
    route: '/plugins',
    permissions: ['Read anomalies', 'Create tickets (demo)'],
    installs: 1560,
  },
];

export function getMarketplaceListing(id: string): MarketplaceListing | undefined {
  return MARKETPLACE_CATALOG.find((l) => l.id === id);
}
