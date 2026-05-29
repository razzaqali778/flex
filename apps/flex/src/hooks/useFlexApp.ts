import { useMemo } from 'react';
import { flexApp } from '../plugins/app/createFlexApp';

/** Access the wired Flex app (Backstage createApp result) */
export function useFlexApp() {
  return useMemo(() => flexApp, []);
}
