import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isExtensionContext } from '../lib/extensionBridge';

/** Apply route from popup / keyboard shortcuts (chrome.storage) */
export function useExtensionNavigate() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isExtensionContext()) return;
    const c = chrome;
    const storage = c?.storage?.local;
    const runtime = c?.runtime;
    if (!storage || !runtime) return;

    const applyRoute = (route: string) => {
      const path = route.startsWith('/') ? route : `/${route}`;
      navigate(path);
    };

    void storage.get(['flex_pending_route', 'flex_pending_action']).then((data) => {
      const route = data.flex_pending_route as string | undefined;
      if (route) {
        applyRoute(route);
        void storage.remove?.('flex_pending_route');
      }
      const action = data.flex_pending_action as string | undefined;
      if (action === 'global-search') {
        window.dispatchEvent(new Event('flex-open-global-search'));
        void storage.remove?.('flex_pending_action');
      } else if (action === 'command-palette') {
        window.dispatchEvent(new Event('flex-open-command-palette'));
        void storage.remove?.('flex_pending_action');
      }
    });

    const onMessage = (msg: unknown) => {
      const m = msg as { type?: string; route?: string };
      if (m.type === 'FLEX_NAVIGATE' && m.route) applyRoute(m.route);
    };

    runtime.onMessage?.addListener(onMessage);
    return () => runtime.onMessage?.removeListener?.(onMessage);
  }, [navigate]);
}
