import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.join(root, 'packages', 'flex-extension-catalog');

const build = spawnSync('npm', ['run', 'build'], { cwd: pkg, stdio: 'inherit', shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

console.log('Extension catalog synced to extensions/shared/ and extensions/vscode/catalog.json');
