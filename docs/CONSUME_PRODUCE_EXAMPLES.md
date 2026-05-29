# Consume & produce — full examples

Copy the reference project: `~/test/examples-all.mjs` (or use snippets below).

**Prerequisites:** `npm run api` + optionally `npm run dev` (Flex at http://localhost:5173).

```javascript
import { createFlexPluginClient, FlexPluginIds as P } from 'flex-plugin-sdk';

const flex = createFlexPluginClient({ apiUrl: 'http://localhost:3847' });
```

## Consume (read from Flex)

| Plugin | `dataset` | Example |
|--------|-----------|---------|
| `flex.dashboard` | `kpi_snapshot` | `flex.consume({ pluginId: P.dashboard, dataset: 'kpi_snapshot' })` |
| `flex.dashboard` | `usage_trend` | `dataset: 'usage_trend'` |
| `flex.governance` | `data_requests` | pending approvals |
| `flex.governance` | `published_datasets` | outbound catalog |
| `flex.governance` | `transfer_log` | audit trail |
| `flex.chargeback` | `team_showback` | team spend rows |
| `flex.chargeback` | `tag_compliance` | tagging |
| `flex.anomalies` | `anomaly_events` | events list |
| `flex.anomalies` | `anomaly_feed` | compact feed |
| `flex.cloud-usage` | `usage_history` | usage |
| `flex.cloud-usage` | `forecast_slices` | forecast |
| `flex.optimization` | `savings_opportunities` | savings |
| `flex.workforce` | `squad_matrix` | squads |
| `flex.resources` | `allocation_matrix` | allocations |
| `flex.alignment` | `alignment_rows` | rows |
| `flex.alignment` | `alignment_score` | score |
| `flex.integrations` | `connected_apps` | partners |
| `flex.integrations` | `partner_consumption` | `params: { partner: 'eztrac' }` |
| `flex.partner.eztrac` | `consumption_status` | EzTrac published data view |
| `flex.partner.dhub-rpt` | `consumption_status` | dhub-rpt published data view |
| `flex.settings` | `preferences` | settings |
| `flex.settings` | `role_catalog` | roles |
| `flex.assistant` | `knowledge_context` | AI context |
| `flex.extension` | `extension_snapshot` | extension badge |

### Extension plugins (install in Flex first)

| Plugin | `dataset` |
|--------|-----------|
| `flex.ext.pagerduty` | `open_incidents` |
| `flex.ext.teams` | `channel_config` |
| `flex.ext.snowflake` | `export_manifest`, `chargeback_rows`, `usage_trend` |
| `flex.ext.jira` | `ticket_candidates` |

## Produce (publish to Flex)

| Plugin | `dataset` | `records` shape |
|--------|-----------|-----------------|
| `flex.partner.eztrac` | `request_sync` | `{ partner: 'eztrac' }` + `sourceApp` |
| `flex.partner.eztrac` | `inbound_request` | `{ fromApp, dataset, recordCount, purpose }` |
| `flex.partner.eztrac` | `pull_published` | `{ partner: 'eztrac' }` |
| `flex.partner.dhub-rpt` | `request_sync` | `{ partner: 'dhub-rpt' }` + `sourceApp` |
| `flex.partner.dhub-rpt` | `inbound_request` | `{ fromApp, dataset, recordCount, purpose }` |
| `flex.partner.dhub-rpt` | `pull_published` | `{ partner: 'dhub-rpt' }` |
| `flex.settings` | `preferences` | `{ spendPulse, presentationMode, ... }` |
| `flex.optimization` | `advance_stage` | `{ id }` |
| `flex.anomalies` | `resolve_anomaly` | `{ id }` |
| `flex.anomalies` | `create_anomaly` | `{ title, severity, service, deltaPct }` |
| `flex.chargeback` | `update_budget` | `{ id, budget?, owner? }` |
| `flex.workforce` | `acknowledge_signal` | `{ id }` |
| `flex.alignment` | `resolve_conflict` | `{ id }` |
| `flex.dashboard` | `kpi_snapshot` | KPI object |
| `flex.assistant` | `chat_intent` | `{ intent, teamId? }` |
| `flex.extension` | `page_context` | `{ url, title }` |
| `flex.ext.pagerduty` | `trigger_page` | `{ anomalyId, severity, routingKey }` |
| `flex.ext.teams` | `post_message` | `{ channel, text }` |
| `flex.ext.jira` | `create_ticket` | `{ anomalyId, projectKey, summary }` |

## Example payloads

### Inbound request (partner plugin)

```javascript
await flex.produce({
  pluginId: 'flex.partner.eztrac',
  dataset: 'inbound_request',
  records: [{
    fromApp: 'eztrac',
    dataset: 'forecast_variance',
    recordCount: 1200,
    purpose: 'Monthly variance from my app',
  }],
  sourceApp: 'eztrac',
});
```

### EzTrac sync (partner plugin)

```javascript
await flex.produce({
  pluginId: 'flex.partner.eztrac',
  dataset: 'request_sync',
  records: [{ partner: 'eztrac' }],
  sourceApp: 'eztrac',
});
```

### Partner consumption

```javascript
await flex.consume({
  pluginId: 'flex.partner.eztrac',
  dataset: 'consumption_status',
});
```

### Catalog

```javascript
const plugins = await flex.catalog();
```

## Browser (Flex tab open, no API)

```javascript
const flex = createFlexPluginClient(); // uses BroadcastChannel / window.FlexPlugins
```

## VS Code

Command Palette → **Flex:** commands (API must be running).
