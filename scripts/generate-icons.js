import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '..', 'extensions', 'chrome', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 48, 128];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#111827"/>
  <path d="M32 88V40l32 24 32-24v48" stroke="#22d3ee" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="64" cy="64" r="8" fill="#818cf8"/>
</svg>`;

for (const size of sizes) {
  fs.writeFileSync(
    path.join(iconsDir, `icon${size}.png`),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )
  );
}

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg);
console.log('Placeholder PNG icons written. Replace with proper assets for production.');
