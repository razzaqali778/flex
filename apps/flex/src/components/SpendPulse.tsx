import { useFlex } from '../store/FlexContext';

/** Ambient 2px spend health bar at top of viewport */
export function SpendPulse() {
  const { kpis, settings } = useFlex();
  if (!settings.spendPulse) return null;

  const budget = 300000;
  const pct = Math.min(100, (kpis.totalSpend / budget) * 100);
  const color =
    pct > 95 ? 'bg-flex-danger' : pct > 85 ? 'bg-flex-warning' : 'bg-flex-success';

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-0.5 z-[200] ${color} transition-colors`}
      style={{ opacity: 0.85 }}
      title={`Spend ${pct.toFixed(0)}% of demo budget`}
    />
  );
}
