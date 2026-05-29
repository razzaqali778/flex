# Flex FinOps — VS Code extension

Install the `.vsix` to call Flex **plugins** from VS Code: get KPIs, chargeback, and send data into Flex.

## Prerequisites

1. Start the Flex API server (from repo root):

   ```bash
   npm run api
   ```

2. Open Flex web app so state syncs to the API (optional but recommended):

   ```bash
   npm run dev
   ```

   Open http://localhost:5173 — state pushes to `http://localhost:3847` automatically.

## Build `.vsix`

```bash
cd extensions/vscode
npm install
npm run package
```

Creates `flex-finops-0.1.0.vsix`.

## Install in VS Code

1. VS Code → Extensions
2. `...` menu → **Install from VSIX...**
3. Select `flex-finops-0.1.0.vsix`
4. Command Palette → **Flex: Connect to API**

## Commands

| Command | Action |
|---------|--------|
| Flex: Connect to API | Check `http://localhost:3847` |
| Flex: Get Dashboard KPIs | consume `flex.dashboard` |
| Flex: Get Team Chargeback | consume `flex.chargeback` |
| Flex: Get Pending Approvals | consume `flex.governance` |
| Flex: Send EzTrac Sync Request | produce → Flex |
| Flex: Send Inbound Data Request | produce → Flex |
| Flex: Open Web App | Open Flex in browser |

## Settings

- `flex.apiUrl` — default `http://localhost:3847`
