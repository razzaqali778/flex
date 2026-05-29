# Repository organization

## What is what

- `apps/flex/`: main Flex web application (global app / host)
- `apps/flex/src/plugins/`: plugin contracts and host runtime
- `packages/flex-plugin-sdk/`: npm SDK for external apps to call Flex plugin APIs
- `extensions/vscode/`: VS Code extension — plugin catalog commands (`.vsix` is build output)
- `extensions/chrome/`: Chrome MV3 — side panel, popup, page sense, plugin API
- `extensions/shared/`: `extensionCatalog.json` (generated from `packages/flex-extension-catalog`)
- `packages/flex-extension-catalog/`: shared actions for web · Chrome · VS Code
- `services/flex-api/`: local REST bridge for VS Code/Node demos
- `packages/plugin-manifests/*.flexext.json`: sample plugin package manifests for marketplace-style installs

## Plugin categories in this repo

- Core Flex plugins: `flex.*` (dashboard, governance, chargeback, etc.)
- Partner plugins: `flex.partner.eztrac`, `flex.partner.dhub-rpt`
- Marketplace extensions: `flex.ext.*` (pagerduty, teams, snowflake, jira)

## Build outputs (do not commit as source)

- `apps/flex/dist/`
- `apps/flex/node_modules/`
- `extensions/vscode/out/`
- `extensions/vscode/node_modules/`
- `extensions/vscode/*.vsix`
- `packages/flex-plugin-sdk/dist/`
- `__MACOSX/` (zip metadata)
