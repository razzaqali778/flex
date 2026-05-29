import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { EXTENSION_ACTIONS, DEFAULT_API_URL, DEFAULT_WEB_URL } from '../dist/catalog.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const payload = {
  version: '1.0.0',
  defaultApiUrl: DEFAULT_API_URL,
  defaultWebUrl: DEFAULT_WEB_URL,
  actions: EXTENSION_ACTIONS,
};

writeFileSync(join(root, 'catalog.json'), JSON.stringify(payload, null, 2));

const sharedDir = join(root, '..', '..', 'extensions', 'shared');
mkdirSync(sharedDir, { recursive: true });
writeFileSync(join(sharedDir, 'extensionCatalog.json'), JSON.stringify(payload, null, 2));

const vscodeDir = join(root, '..', '..', 'extensions', 'vscode');
writeFileSync(join(vscodeDir, 'catalog.json'), JSON.stringify(payload, null, 2));

console.log('Wrote catalog.json, extensions/shared/, and extensions/vscode/catalog.json');
