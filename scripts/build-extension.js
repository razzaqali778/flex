import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

spawnSync('node', ['scripts/sync-extension-catalog.mjs'], { cwd: root, stdio: 'inherit' });
const appDist = path.join(root, 'apps', 'flex', 'dist');
const extDir = path.join(root, 'extensions', 'chrome');
const extApp = path.join(extDir, 'app');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Run "npm run build" in apps/flex first. Missing:', src);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(extApp)) fs.rmSync(extApp, { recursive: true });
copyRecursive(appDist, extApp);

console.log('Extension app bundle copied to extensions/chrome/app/');
console.log('Load unpacked extension from:', extDir);
