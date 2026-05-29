import { useCallback, useEffect, useState } from 'react';
import {
  extensionInstallState,
  installFromMarketplace,
  listInstalledExtensions,
  listMarketplace,
  toggleExtension,
  uninstallFromMarketplace,
} from '../plugins/manager';
import { subscribeExtensionChanges } from '../plugins/pluginInstallStore';
import type { InstalledExtension, MarketplaceListing } from '../plugins/types';

export function useInstalledExtensions() {
  const [installed, setInstalled] = useState<InstalledExtension[]>(() => listInstalledExtensions());
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setInstalled(listInstalledExtensions());
    setTick((n) => n + 1);
  }, []);

  useEffect(() => subscribeExtensionChanges(refresh), [refresh]);

  const marketplace: MarketplaceListing[] = listMarketplace();

  return {
    marketplace,
    installed,
    refreshKey: tick,
    install: (id: string) => {
      const result = installFromMarketplace(id);
      if ('error' in result) return result;
      refresh();
      return result;
    },
    uninstall: (id: string) => {
      const result = uninstallFromMarketplace(id);
      refresh();
      return result;
    },
    setEnabled: (id: string, enabled: boolean) => {
      toggleExtension(id, enabled);
      refresh();
    },
    stateFor: (id: string) => extensionInstallState(id),
  };
}
