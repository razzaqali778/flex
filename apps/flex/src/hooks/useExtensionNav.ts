import { useMemo } from 'react';
import { isPluginEnabled } from '../plugins/manager';
import { pluginIdForPath, isPathAlwaysOn } from '../plugins/app/routeBindings';
import { useInstalledExtensions } from './useInstalledExtensions';

export function useExtensionNav() {
  const { refreshKey } = useInstalledExtensions();

  return useMemo(() => {
    void refreshKey;
    const isEnabled = (pluginId: string | undefined) => {
      if (!pluginId) return true;
      return isPluginEnabled(pluginId);
    };

    const isNavPathVisible = (to: string, pluginId?: string) => {
      if (to === '/plugins') return true;
      if (pluginId) return isEnabled(pluginId);
      const pid = pluginIdForPath(to);
      if (pid === null && isPathAlwaysOn(to)) return true;
      return pid ? isEnabled(pid) : true;
    };

    return { isEnabled, isNavPathVisible, pluginIdForPath };
  }, [refreshKey]);
}
