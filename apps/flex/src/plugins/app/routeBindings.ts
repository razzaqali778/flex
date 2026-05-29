import { flexApp } from './createFlexApp';

/** Routes that stay visible regardless of plugin enablement */
export const ALWAYS_ON_PATHS = new Set(['/plugins', '/settings', '/partner']);

export function pluginIdForPath(pathname: string): string | null {
  if (ALWAYS_ON_PATHS.has(pathname)) return null;

  const bindings = flexApp.listRouteBindings();
  const sorted = [...bindings].sort((a, b) => b.path.length - a.path.length);

  for (const { path, pluginId } of sorted) {
    if (path === '/') {
      if (pathname === '/') return pluginId;
      continue;
    }
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return pluginId;
    }
  }

  return null;
}

export function isPathAlwaysOn(pathname: string): boolean {
  return ALWAYS_ON_PATHS.has(pathname) || pathname.startsWith('/plugins');
}
