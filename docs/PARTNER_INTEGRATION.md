# Partner integration

> **VS Code:** Install the `.vsix` package — see [VSCODE_EXTENSION.md](./VSCODE_EXTENSION.md).  
> **All consume/produce examples:** [CONSUME_PRODUCE_EXAMPLES.md](./CONSUME_PRODUCE_EXAMPLES.md) and `~/test/examples-all.mjs`.

Plugins let partners **get & send data** via the plugin API:

Plugins exist so **other apps** can:

- **consume** — read Flex data (KPIs, chargeback, approvals, …)
- **produce** — send data into Flex (inbound requests, partner sync, …)

## Partner apps (EzTrac & dhub-rpt)

Simulated external applications — plugin consume/produce uses the browser bridge; the shared API stores the demo marketplace registry.

Run them on different ports to match the real deployment shape:

```bash
# Terminal 1: Flex host
npm run dev:flex

# Terminal 2: EzTrac partner app
npm run dev:eztrac

# Terminal 3: dhub-rpt partner app
npm run dev:rpt
```

| App | URL |
|-----|-----|
| **Flex** | http://localhost:5173/ |
| **Marketplace** | http://localhost:5176/ |
| **EzTrac** | http://localhost:5174/ |
| **dhub-rpt** | http://localhost:5175/ |

1. Open Flex on `http://localhost:5173/`.
2. Open Flex → **Marketplace Publisher** and publish plugins to EzTrac, dhub-rpt, or both.
3. Open Marketplace on `http://localhost:5176/`.
4. Pick the target app and install the plugins that app needs.
5. Open EzTrac or dhub-rpt. The app shows installed plugins and all available install/uninstall actions.
6. Use **Read** actions to consume Flex data, or **Send to Flex** actions to produce governed data into Flex.

For marketplace-driven installs:

1. Start `npm run api`.
2. In Flex, open **Marketplace Publisher** and publish selected plugins, or publish all visible plugins, to EzTrac or dhub-rpt.
3. In Marketplace, choose the app and install one plugin or all visible plugins.
4. Installed plugins expose dataset buttons inside EzTrac and dhub-rpt. Produce actions that send partner data to Flex create pending approvals in **Governance → Data Exchange Hub**.

## Where plugins are visible

| Place | What you see |
|-------|--------------|
| Flex `http://localhost:5173/plugins` | Full Flex plugin catalog: core, partner, marketplace add-ons |
| EzTrac `http://localhost:5174/apps/eztrac` | EzTrac sees plugins published to its marketplace and can install/uninstall them |
| dhub-rpt `http://localhost:5175/apps/dhub-rpt` | dhub-rpt sees plugins published to its marketplace and can install/uninstall them |

Flex hosts the plugin contracts. Partner apps install published plugins before they are allowed to call those contracts.

## Quick demo (Partner console)

1. **Tab A:** Open Flex → `http://localhost:5173/` (keep open)
2. **Tab B:** **Partner console** → `http://localhost:5173/partner`
3. Status should show **Connected**
4. Click **Get team chargeback** or **EzTrac sends a data request**
5. In Tab A, open **Governance → Approvals** to see inbound data

No console code. Same-origin demos use `BroadcastChannel`; different ports use `postMessage` to the connected Flex window.

## From your own app (npm)

```bash
npm install ./packages/flex-plugin-sdk
```

```typescript
import { createFlexPluginClient, FlexPluginIds } from 'flex-plugin-sdk';

// Same-origin browser demo. For different origins, use postMessage/window target.
const client = createFlexPluginClient({ useBroadcast: true });

// GET from Flex
const kpis = await client.consume({
  pluginId: FlexPluginIds.dashboard,
  dataset: 'kpi_snapshot',
});

// SEND to Flex
await client.produce({
  pluginId: FlexPluginIds.partnerEzTrac,
  dataset: 'inbound_request',
  records: [{
    fromApp: 'eztrac',
    dataset: 'forecast_variance',
    recordCount: 500,
    purpose: 'Q3 refresh',
  }],
  sourceApp: 'eztrac',
});
```

## Plugin IDs (features)

| Action | pluginId | dataset |
|--------|----------|---------|
| KPIs | `flex.dashboard` | `kpi_snapshot` |
| Pending approvals | `flex.governance` | `data_requests` |
| Chargeback | `flex.chargeback` | `team_showback` |
| EzTrac plugin | `flex.partner.eztrac` | `request_sync`, `inbound_request`, `pull_published` |
| dhub-rpt plugin | `flex.partner.dhub-rpt` | `request_sync`, `inbound_request`, `pull_published` |

See [PLUGINS.md](./PLUGINS.md) for the full catalog.

## Dev-only notes

- `services/flex-api` stores the partner marketplace registry and also serves the local REST bridge for Node / VS Code demos.
- Partner app data calls still use the Flex plugin bridge after **Connect Flex**.

## Production note

- Different ports are supported in this demo through `postMessage` after the partner app opens/connects to Flex.
- Production should use a signed iframe/popup strategy with strict origin allowlists instead of wildcard demo messaging.
