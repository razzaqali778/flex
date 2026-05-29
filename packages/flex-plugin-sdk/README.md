# flex-plugin-sdk

TypeScript client for the **Flex Plugin API** — consume FinOps data or send governed updates from partner apps (EzTrac, dhub-rpt) or your own integrations.

## Install

```bash
npm install flex-plugin-sdk
```

For local development in this monorepo:

```bash
npm install ./packages/flex-plugin-sdk
```

## Usage (browser, Flex app open)

```typescript
import { createFlexPluginClient, FlexPluginIds } from 'flex-plugin-sdk';

const client = createFlexPluginClient();

// List plugins
const catalog = await client.catalog();

// Read KPIs
const kpis = await client.consume({
  pluginId: FlexPluginIds.dashboard,
  dataset: 'kpi_snapshot',
});

// Simulate EzTrac inbound request through the partner plugin
await client.produce({
  pluginId: FlexPluginIds.partnerEzTrac,
  dataset: 'request_sync',
  records: [{ partner: 'eztrac' }],
});
```

When Flex is embedded in the Chrome extension side panel, pass the panel `contentWindow` as `target` if calling from an external page.

## Host SDK (slots + lifecycle)

The same package can also turn a React app into a plugin host. For the local architecture prototype, registry and install state can run fully in memory.

```tsx
import {
  MemoryPluginRegistry,
  PluginHost,
  PluginProvider,
  Slot,
} from 'flex-plugin-sdk';

const registry = new MemoryPluginRegistry([
  {
    manifestVersion: '2',
    id: 'com.flex.pdf-exporter',
    name: 'Flex PDF Exporter',
    version: '1.0.0',
    entry: 'index.js',
    permissions: ['ui:render', 'event:emit', 'event:listen', 'storage:read', 'storage:write'],
    ui: { slots: ['toolbar'] },
  },
]);

const host = new PluginHost({
  appId: 'flex-app-001',
  registry,
  sandbox: 'iframe',
  permissions: ['ui', 'event', 'storage', 'network'],
});

await host.install('com.flex.pdf-exporter');
await host.enable('com.flex.pdf-exporter');

function App() {
  return (
    <PluginProvider host={host}>
      <aside>
        <Slot name="sidebar" />
      </aside>
      <main>
        <Slot name="main-panel" />
      </main>
      <footer>
        <Slot name="toolbar" />
      </footer>
    </PluginProvider>
  );
}
```

Plugins receive a scoped bridge with event, UI, storage, request, and proxied network APIs:

```typescript
const bridge = host.getBridge('com.flex.pdf-exporter');

bridge.ui.registerSlotComponent('toolbar', 'Export PDF');
bridge.emit('flex:document:export', { format: 'pdf' });
await bridge.storage.set('lastFormat', 'pdf');
```

## Direct API (same origin)

If your script runs inside the Flex app:

```javascript
const data = await window.FlexPlugins.consume({
  pluginId: 'flex.governance',
  dataset: 'data_requests',
});
```

## Plugin catalog

| Plugin ID | Area |
|-----------|------|
| `flex.dashboard` | Dashboard KPIs |
| `flex.governance` | Approvals & publish |
| `flex.settings` | RBAC & preferences |
| `flex.cloud-usage` | Usage & forecast |
| `flex.optimization` | Savings lifecycle |
| `flex.anomalies` | Cost incidents |
| `flex.chargeback` | Team showback |
| `flex.workforce` | Squad × infra |
| `flex.resources` | Allocations |
| `flex.alignment` | Cross-app drift |
| `flex.integrations` | Partner sync |
| `flex.partner.eztrac` | EzTrac partner contract |
| `flex.partner.dhub-rpt` | dhub-rpt partner contract |
| `flex.assistant` | AI context |
| `flex.extension` | Extension snapshot |

See [docs/PLUGINS.md](../../docs/PLUGINS.md) for dataset schemas and produce payloads.
