import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { PartnerId } from '../pages/partner-apps/PartnerExternalApp';

const PARTNER_URLS: Record<PartnerId, { label: string; url: string }> = {
  eztrac: { label: 'EzTrac', url: 'http://localhost:5174/' },
  'dhub-rpt': { label: 'dhub-rpt', url: 'http://localhost:5175/' },
};

/** Slim chrome for embedded partner iframes — full app UI lives inside the iframe. */
export function PartnerAppLayout({ lockedPartner }: { lockedPartner?: PartnerId }) {
  const location = useLocation();
  const activePartner: PartnerId =
    lockedPartner ?? (location.pathname.includes('dhub-rpt') ? 'dhub-rpt' : 'eztrac');

  const active = PARTNER_URLS[activePartner];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#090c14]">
      <header className="shrink-0 grid gap-2 px-3 py-2 border-b border-white/8 bg-[#090c14]/98 sm:grid-cols-[1fr_auto] sm:items-center sm:px-4">
        <div className="flex items-center gap-3 min-w-0">
          {!lockedPartner && (
            <nav
              className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8 shrink-0"
              aria-label="Partner app"
            >
              {(Object.keys(PARTNER_URLS) as PartnerId[]).map((id) => {
                const meta = PARTNER_URLS[id];
                const isActive = id === activePartner;
                return (
                  <Link
                    key={id}
                    to={`/apps/${id === 'dhub-rpt' ? 'dhub-rpt' : 'eztrac'}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? id === 'eztrac'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-violet-500/20 text-violet-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {meta.label}
                  </Link>
                );
              })}
            </nav>
          )}
          {lockedPartner && (
            <span className="text-sm font-semibold text-slate-100 truncate">{active.label}</span>
          )}
          <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
            Plugin console (embedded)
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <a
            href={active.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 border border-white/10 hover:text-white"
          >
            <ExternalLink className="w-3 h-3" />
            Tab
          </a>
          <a
            href="http://localhost:5173/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-flex-accent border border-flex-accent/30 bg-flex-accent/10"
          >
            Flex
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
