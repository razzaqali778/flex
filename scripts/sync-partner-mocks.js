/**
 * Optional helper: copies EzTrac calendar CSV into apps/flex public data for reference.
 * Run: node scripts/sync-partner-mocks.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const eztracCsv = path.join(
  process.env.HOME || '',
  'Desktop',
  'EZTrac',
  'eztrac-notes',
  'calendar-setup',
  'resources',
  'EZTRAC_2026_SETUP.csv'
);
const outDir = path.join(root, 'apps', 'flex', 'public', 'partner-data');
const outFile = path.join(outDir, 'EZTRAC_2026_SETUP.csv');

if (!fs.existsSync(eztracCsv)) {
  console.warn('EzTrac CSV not found at:', eztracCsv);
  console.warn('Mocks in src/data/partners/ are still used by RAG.');
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(eztracCsv, outFile);
console.log('Copied calendar CSV to', outFile);
