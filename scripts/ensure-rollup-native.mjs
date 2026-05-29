/**
 * npm sometimes skips Rollup's platform optional deps (npm/cli#4828).
 * Install the native binary for the current OS/arch when it's missing.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { arch, platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const NATIVE_BY_PLATFORM = {
  'darwin-arm64': '@rollup/rollup-darwin-arm64',
  'darwin-x64': '@rollup/rollup-darwin-x64',
  'linux-arm64': '@rollup/rollup-linux-arm64-gnu',
  'linux-x64': '@rollup/rollup-linux-x64-gnu',
  'win32-x64': '@rollup/rollup-win32-x64-msvc',
  'win32-arm64': '@rollup/rollup-win32-arm64-msvc',
};

const key = `${platform()}-${arch()}`;
const nativePkg = NATIVE_BY_PLATFORM[key];
if (!nativePkg) process.exit(0);

const rollupVersionPath = join(root, 'node_modules', 'rollup', 'package.json');
if (!existsSync(rollupVersionPath)) process.exit(0);

const version = JSON.parse(readFileSync(rollupVersionPath, 'utf8')).version;
const folder = nativePkg.split('/')[1];
const nativeDir = join(root, 'node_modules', '@rollup', folder);

if (existsSync(nativeDir)) process.exit(0);

console.log(`[postinstall] Installing missing ${nativePkg}@${version}…`);
execSync(`npm install ${nativePkg}@${version} --no-save`, {
  cwd: root,
  stdio: 'inherit',
});
