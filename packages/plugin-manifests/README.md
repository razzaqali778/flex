# Flex extension packages (`.flexext.json`)

Like VS Code’s `.vsix` / `package.json`, each file describes one installable extension.

## Install in Flex

1. Open **Tools → Extensions → Marketplace**
2. Click **Install from file…**
3. Choose e.g. `snowflake.flexext.json` from this folder

Or use **Install from URL** with a hosted manifest (same JSON).

## Package format

```json
{
  "id": "flex.ext.snowflake",
  "name": "Snowflake Export",
  "version": "1.0.3",
  "publisher": "Snowflake",
  "description": "...",
  "entry": "bundles/snowflake",
  "engines": { "flex": "^1.0.0" },
  "permissions": ["chargeback:read"]
}
```

`entry` must match a bundle built into Flex (demo). Production would verify signatures and load remote code safely.
