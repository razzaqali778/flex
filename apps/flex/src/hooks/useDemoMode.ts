import { useCallback, useEffect, useState } from 'react';

const KEY = 'flex_demo_mode';

export function useDemoMode() {
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem(KEY) === '1');

  useEffect(() => {
    document.documentElement.classList.toggle('demo-mode', demoMode);
    localStorage.setItem(KEY, demoMode ? '1' : '0');
  }, [demoMode]);

  const toggle = useCallback(() => setDemoMode((d) => !d), []);

  return { demoMode, toggle, setDemoMode };
}
