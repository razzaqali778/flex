#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/extensions/vscode"

# nvm breaks when npm_config_prefix points at a global npm prefix (common on macOS)
unset npm_config_prefix

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1 || true
fi

if ! node -e "const v=process.versions.node.split('.').map(Number); process.exit(v[0]>=20?0:1)"; then
  echo "Node 20+ required to package VSIX."
  echo "  unset npm_config_prefix"
  echo "  nvm install 20 && nvm use 20"
  echo "  npm run package:vsix"
  exit 1
fi

npm install
npm run package

VERSION="$(node -p "require('./package.json').version")"
VSIX="$ROOT/extensions/vscode/flex-finops-${VERSION}.vsix"
echo ""
if [ -f "$VSIX" ]; then
  echo "VSIX ready: $VSIX"
else
  echo "Expected VSIX not found: $VSIX"
  ls -la "$ROOT/extensions/vscode/"*.vsix 2>/dev/null || true
  exit 1
fi
