import { Link, useLocation } from 'react-router-dom';
import { Plug } from 'lucide-react';
import { useExtensionNav } from '../hooks/useExtensionNav';
import { isPathAlwaysOn } from '../plugins/marketplace/routeRegistry';
import { getMarketplaceListing } from '../plugins/marketplace/catalog';

export function ExtensionRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { isEnabled, pluginIdForPath } = useExtensionNav();

  if (isPathAlwaysOn(pathname)) return <>{children}</>;

  const pluginId = pluginIdForPath(pathname);
  if (!pluginId || isEnabled(pluginId)) return <>{children}</>;

  const listing = getMarketplaceListing(pluginId);

  return (
    <div className="page-shell max-w-lg flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Plug className="w-12 h-12 text-flex-muted mb-4" />
      <h2 className="font-display font-semibold text-lg">Extension disabled</h2>
      <p className="text-sm text-flex-muted mt-2">
        <strong>{listing?.name ?? pluginId}</strong> is turned off. Enable it in Extensions to use this
        page — like VS Code.
      </p>
      <Link
        to="/plugins"
        className="mt-6 px-4 py-2 rounded-lg bg-flex-accent/20 text-flex-accent border border-flex-accent/40 text-sm font-medium"
      >
        Open Extensions
      </Link>
    </div>
  );
}
