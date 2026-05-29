import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DASHBOARD_HUB } from '../lib/navStructure';
import { filterRoutesByFeaturePlugins } from '../lib/featurePlugins';

export function DashboardHub() {
  const groups = DASHBOARD_HUB.map((group) => ({
    ...group,
    links: filterRoutesByFeaturePlugins(group.links),
  })).filter((group) => group.links.length > 0);

  if (!groups.length) return null;

  return (
    <section className="mt-8 pt-6 border-t border-flex-border/30">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display font-semibold text-base">Go to</h2>
          <p className="text-xs text-flex-muted mt-0.5">Shortcuts to enabled areas</p>
        </div>
        <Link to="/plugins" className="text-xs text-flex-accent hover:underline">
          Plugins & marketplace →
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {groups.map((group) => (
          <div
            key={group.section}
            className="rounded-xl p-3 border border-flex-border/30 bg-flex-surface/30"
          >
            <p className="text-xs font-semibold text-slate-300 mb-2">{group.section}</p>
            <ul className="space-y-1">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center justify-between gap-1 text-xs text-flex-muted hover:text-flex-accent py-0.5 group"
                  >
                    <span className="truncate">{link.label}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
