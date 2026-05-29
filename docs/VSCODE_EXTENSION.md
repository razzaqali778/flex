# Install Flex in VS Code (`.vsix`)

## 1. Start Flex API

```bash
cd /path/to/flex-repo
npm install
npm run api
```

Runs on **http://localhost:3847**

## 2. (Recommended) Open Flex web app

```bash
npm run dev
```

Open http://localhost:5173 — your data syncs to the API so VS Code sees real state.

## 3. Build the VSIX package

```bash
npm run package:vsix
```

Requires **Node 20+** (uses `nvm` if installed). Output:

`extensions/vscode/flex-finops-0.2.0.vsix`

If packaging stops with `nvm is not compatible with npm_config_prefix`, run:

```bash
unset npm_config_prefix
npm run package:vsix
```

Node **20+** is required (`nvm install 20`).

## 4. Install in VS Code

1. Open VS Code
2. Extensions sidebar → **`...`** → **Install from VSIX...**
3. Pick `flex-finops-0.2.0.vsix`
4. Reload if prompted

## 5. Use it

Command Palette (`Cmd+Shift+P`):

- **Flex: Connect to API** — must succeed first
- **Flex: Get Dashboard KPIs**
- **Flex: Send EzTrac Sync Request** — sends data **to** Flex
- **Flex: Open Web App** — view approvals in browser

Results appear in the **Flex FinOps** output panel.

## Multi-host catalog

VS Code and Chrome share **`packages/flex-extension-catalog`** — the same plugin actions as the web app.

- **Flex: Run Plugin Action…** — quick pick from the catalog
- Individual commands map to `commandId` in the catalog (e.g. `flex.getKpis`)

See [EXTENSION_HOSTS.md](./EXTENSION_HOSTS.md).

## How it relates to plugins

VS Code does **not** load `.flexext.json` files. It calls the same plugin API as the Partner console:

- `POST /api/v1/consume` — get data from Flex
- `POST /api/v1/produce` — send data to Flex

Plugin IDs: `flex.dashboard`, `flex.governance`, `flex.chargeback`, `flex.integrations`, etc.
