import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isExtensionContext } from '../lib/extensionBridge';

const G_ROUTES: Record<string, string> = {
  d: '/',
  e: '/govern/exchange',
  a: '/assistant',
  c: '/chargeback',
  w: '/workforce',
  s: '/settings',
  i: '/govern/partners',
  n: '/anomalies',
  o: '/optimization',
  l: '/govern/alignment',
  h: '/cloud',
  r: '/resources',
};

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const navigate = useNavigate();
  const inExtension = isExtensionContext();
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inExtension) return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === '?' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onShowHelp();
        return;
      }

      if (typing) return;

      if (gPending.current && G_ROUTES[e.key.toLowerCase()]) {
        e.preventDefault();
        navigate(G_ROUTES[e.key.toLowerCase()]);
        gPending.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          gPending.current = false;
        }, 1200);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [inExtension, navigate, onShowHelp]);
}

export function useShortcutsHelp() {
  const [open, setOpen] = useState(false);
  return {
    shortcutsOpen: open,
    openShortcuts: () => setOpen(true),
    closeShortcuts: () => setOpen(false),
    toggleShortcuts: () => setOpen((o) => !o),
  };
}
