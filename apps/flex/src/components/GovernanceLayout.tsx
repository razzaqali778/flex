import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { Badge } from './Badge';
import { GOVERNANCE_TABS } from '../lib/navStructure';
import { useExtensionNav } from '../hooks/useExtensionNav';
import { useFlex } from '../store/FlexContext';

export function GovernanceLayout() {
  const { pendingCount } = useFlex();
  const location = useLocation();
  const { isEnabled } = useExtensionNav();
  const tabs = GOVERNANCE_TABS.filter((t) => isEnabled(t.pluginId));

  return (
    <div className="page-shell">
      <PageHeader
        title="Governance"
        description="One workflow: partner requests → approve & publish → verify alignment."
        action={
          pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} awaiting approval</Badge>
          ) : undefined
        }
      />

      <ol className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 p-4 rounded-xl border border-flex-accent/20 bg-flex-accent/5 text-sm list-none">
        <li>
          <span className="text-flex-muted">1.</span>{' '}
          <strong className="text-slate-200">Partner apps</strong>
          <span className="text-flex-muted"> — trigger requests</span>
        </li>
        <li>
          <span className="text-flex-muted">2.</span>{' '}
          <strong className="text-slate-200">Exchange</strong>
          <span className="text-flex-muted"> — approve & publish</span>
        </li>
        <li>
          <span className="text-flex-muted">3.</span>{' '}
          <strong className="text-slate-200">Alignment</strong>
          <span className="text-flex-muted"> — verify cross-app</span>
        </li>
      </ol>

      <nav
        className="flex flex-col sm:flex-row gap-1 p-1 mb-6 rounded-xl bg-flex-surface/50 border border-flex-border/50"
        aria-label="Governance sections"
      >
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 px-3 py-2.5 rounded-lg text-left sm:text-center transition-colors ${
                active
                  ? 'bg-flex-accent/15 text-flex-accent border border-flex-accent/30'
                  : 'text-flex-muted hover:text-slate-200 hover:bg-flex-surface/80 border border-transparent'
              }`}
            >
              <span className="flex items-center justify-center sm:justify-center gap-1.5 text-sm font-medium">
                {tab.label}
                {tab.to === '/govern/exchange' && pendingCount > 0 && (
                  <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-flex-warning text-flex-bg text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </span>
              <span className="block text-[10px] mt-0.5 opacity-80">{tab.short}</span>
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
