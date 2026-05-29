import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useBreakpoint() {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');

    const update = () => setBp(getBreakpoint(window.innerWidth));

    update();
    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mqMobile.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return {
    breakpoint: bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    /** Icon-only sidebar on tablet; full labels on desktop */
    compactNav: bp === 'tablet',
  };
}

/** @deprecated Use useBreakpoint().compactNav */
export function useCompactLayout() {
  const { compactNav } = useBreakpoint();
  return compactNav;
}
