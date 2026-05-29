/**
 * flex-api origin (no trailing slash).
 * Dev: empty string — fetch `/api/v1/...` and `/health` via Vite proxy to :3847.
 * Prod / override: set VITE_FLEX_API_URL e.g. http://localhost:3847
 */
export function flexApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_FLEX_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return '';
  return 'http://localhost:3847';
}
