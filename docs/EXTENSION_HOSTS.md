# Flex across hosts (web · Chrome · VS Code)

One **plugin action catalog** powers multiple surfaces:

| Host | What you get |
|------|----------------|
| **Web** (`apps/flex`) | Full UI, `window.FlexPlugins`, consume/produce |
| **Chrome** (`extensions/chrome`) | Side panel app, popup KPIs, cloud page sense, plugin API buttons |
| **VS Code** (`extensions/vscode`) | Command palette actions → same REST plugin API |
| **Partner apps** (EzTrac, RPT) | `flex-plugin-sdk` + marketplace |

Catalog source: `packages/flex-extension-catalog/src/catalog.ts`

## Setup

```bash
npm install
npm run api          # http://localhost:3847
npm run dev:flex     # http://localhost:5173
npm run sync:extension-catalog   # JSON for Chrome + VS Code
```

## Chrome extension

1. `npm run build` (copies Flex app + syncs catalog)
2. Chrome → Extensions → Load unpacked → `extensions/chrome`
3. **Popup**: KPIs from local storage + **Plugin API** buttons (consume/produce via API)
4. **Side panel**: full Flex app (Alt+Shift+D, etc.)
5. **Content scripts**: AWS / Azure / GCP page sense

Requires `host_permissions` for `localhost:3847` when using API actions from the popup.

## VS Code extension

```bash
npm run package:vsix
```

Install `extensions/vscode/flex-finops-0.2.0.vsix`

Commands (from shared catalog):

- **Flex: Run Plugin Action…** — quick pick of all VS Code actions
- **Flex: Connect to API**
- **Flex: Get Dashboard KPIs** / chargeback / approvals / …
- **Flex: Send EzTrac Sync Request** / inbound request

Settings: `flex.apiUrl`, `flex.webUrl`

## Adding a new cross-host action

Edit `packages/flex-extension-catalog/src/catalog.ts`:

```typescript
{
  id: 'my-action',
  label: 'My action',
  description: '…',
  kind: 'consume',
  category: 'cost',
  hosts: ['vscode', 'chrome', 'web'],
  pluginId: 'flex.chargeback',
  dataset: 'team_showback',
  commandId: 'myAction',  // VS Code: flex.myAction
}
```

Then:

```bash
npm run sync:extension-catalog
```

Rebuild VSIX / reload Chrome extension.
