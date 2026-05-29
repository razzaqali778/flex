import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Presentation, X, Zap } from 'lucide-react';
import { useFlex } from '../store/FlexContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useExtensionNavigate } from '../hooks/useExtensionNavigate';
import { useFlexPlugins } from '../hooks/useFlexPlugins';
import { useKeyboardShortcuts, useShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { isExtensionContext } from '../lib/extensionBridge';
import { NAV_SECTIONS } from '../lib/navStructure';
import { useExtensionNav } from '../hooks/useExtensionNav';
import { ExtensionRouteGuard } from './ExtensionRouteGuard';
import { CommandPalette } from './CommandPalette';
import { ExtensionTopBar } from './ExtensionTopBar';
import { GlobalSearch } from './GlobalSearch';
import { MeetingModeBanner } from './MeetingModeBanner';
import { ShortcutsHelp } from './ShortcutsHelp';
import { SpendPulse } from './SpendPulse';
import { UndoToast } from './UndoToast';

export function Layout() {
  const { pendingCount, lastActionError, settings } = useFlex();
  const { isMobile, compactNav } = useBreakpoint();
  const [navOpen, setNavOpen] = useState(false);
  const isExtension = isExtensionContext();
  const location = useLocation();
  const showLabels = !compactNav || isMobile;
  const { shortcutsOpen, openShortcuts, closeShortcuts } = useShortcutsHelp();
  const { isNavPathVisible } = useExtensionNav();

  useExtensionNavigate();
  useKeyboardShortcuts(openShortcuts);
  useFlexPlugins();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, navOpen]);

  const sidebarContent = (
    <>
      <div
        className={`border-b border-flex-border/40 flex items-center justify-between ${
          showLabels ? 'p-4 sm:p-6' : 'p-3'
        }`}
      >
        <div className={`flex items-center ${showLabels ? 'gap-3' : 'justify-center w-full'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flex-accent/30 to-flex-accent2/30 flex items-center justify-center shadow-glow shrink-0">
            <Zap className="w-5 h-5 text-flex-accent" />
          </div>
          {showLabels && (
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg gradient-text truncate">Flex</h1>
              <p className="text-xs text-flex-muted">FinOps Platform</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="p-2 rounded-lg text-flex-muted hover:text-slate-200 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-2 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            isNavPathVisible(item.to, item.pluginId)
          );
          if (!visibleItems.length) return null;
          return (
          <div key={section.id}>
            {showLabels && (
              <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-flex-muted/70">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map(({ to, icon: Icon, label, badge }) => {
                const isGovernance = to.startsWith('/govern');
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    title={!showLabels ? label : undefined}
                    onClick={() => isMobile && setNavOpen(false)}
                    className={({ isActive }) => {
                      const active = isGovernance ? location.pathname.startsWith('/govern') : isActive;
                      return `flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                        showLabels ? 'px-3 py-2.5' : 'justify-center px-2 py-2.5'
                      } ${
                        active
                          ? 'bg-flex-accent/15 text-flex-accent border border-flex-accent/30'
                          : 'text-flex-muted hover:text-slate-200 hover:bg-flex-surface/50 border border-transparent'
                      }`;
                    }}
                  >
                    <span className="relative shrink-0">
                      <Icon className="w-4 h-4" />
                      {badge === 'pending' && pendingCount > 0 && !showLabels && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-flex-warning" />
                      )}
                    </span>
                    {showLabels && (
                      <>
                        <span className="flex-1 truncate">{label}</span>
                        {badge === 'pending' && pendingCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-flex-warning text-flex-bg text-xs font-bold">
                            {pendingCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <SpendPulse />
      {isExtension && (
        <ExtensionTopBar onMenuClick={isMobile ? () => setNavOpen(true) : undefined} />
      )}

      {settings.presentationMode && (
        <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 bg-flex-accent2/15 border-b border-flex-accent2/30 text-xs text-flex-accent2">
          <Presentation className="w-3.5 h-3.5" />
          Presentation mode — polished visuals for demos
        </div>
      )}

      {!isExtension && isMobile && (
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-flex-border/50 bg-flex-bg/95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="p-2 rounded-lg text-flex-muted hover:text-flex-accent"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Zap className="w-5 h-5 text-flex-accent" />
          <span className="font-display font-semibold">Flex</span>
        </header>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {isMobile && navOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          />
        )}

        <aside
          className={`shrink-0 border-r border-flex-border/60 glass flex flex-col overflow-hidden ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] shadow-2xl transition-transform ${
                  navOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
                }`
              : `h-full ${compactNav ? 'w-[72px]' : 'w-56'}`
          }`}
        >
          {sidebarContent}
        </aside>

        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col">
          {settings.meetingMode && location.pathname === '/' && <MeetingModeBanner />}
          {lastActionError && (
            <div className="mx-4 mt-3 p-3 rounded-lg border border-flex-danger/40 bg-flex-danger/10 text-sm text-flex-danger shrink-0">
              {lastActionError}
            </div>
          )}
          <ExtensionRouteGuard>
            <Outlet />
          </ExtensionRouteGuard>
        </main>
      </div>
      <CommandPalette />
      <GlobalSearch />
      <ShortcutsHelp open={shortcutsOpen} onClose={closeShortcuts} />
      <UndoToast />
    </div>
  );
}
