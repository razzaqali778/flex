import { useEffect, useState, type ReactNode } from 'react';
import { LayoutGrid, Menu, Package, Store, X, type LucideIcon } from 'lucide-react';
import type { PartnerTab, PartnerTheme } from './types';

export type { PartnerTab };

export interface PartnerShellProps {
  theme: PartnerTheme;
  brandIcon: ReactNode;
  appName: string;
  tagline: string;
  tab: PartnerTab;
  onTabChange: (tab: PartnerTab) => void;
  /** Which nav tabs to show (marketplace omits workspace). */
  tabs?: PartnerTab[];
  stats: { label: string; value: number | string }[];
  tabLabels?: Partial<Record<PartnerTab, string>>;
  /** Optional count badges on nav tabs (e.g. workspace imports). */
  tabBadges?: Partial<Record<PartnerTab, number>>;
  /** Show a thin loading bar under the header while data is fetching. */
  loading?: boolean;
  topActions?: ReactNode;
  title: string;
  subtitle: string;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Hide sidebar — used when embedded inside Flex iframe */
  embed?: boolean;
  /** Optional links rendered in sidebar footer (Open Flex, marketplace, etc.) */
  sidebarLinks?: { label: string; href: string; icon?: ReactNode }[];
}

const DEFAULT_TAB_LABELS: Record<PartnerTab, string> = {
  workspace: 'Data workspace',
  installed: 'Installed',
  all: 'Add plugins',
};

const TAB_ICONS: Partial<Record<PartnerTab, LucideIcon>> = {
  workspace: LayoutGrid,
  installed: Package,
  all: Store,
};

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);
  return mobile;
}

function SidebarBrand({
  brandIcon,
  appName,
  tagline,
  onCloseMobile,
}: {
  brandIcon: ReactNode;
  appName: string;
  tagline: string;
  onCloseMobile?: () => void;
}) {
  return (
    <div className="partner-sidebar-brand">
      <div className="partner-brand-inner">
        <span className="partner-brand-mark" aria-hidden>
          {brandIcon}
        </span>
        <div className="partner-brand-text">
          <h1 className="partner-brand-title">{appName}</h1>
          <p>{tagline}</p>
        </div>
      </div>
      {onCloseMobile && (
        <button
          type="button"
          className="partner-sidebar-close"
          aria-label="Close menu"
          onClick={onCloseMobile}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

function SidebarNav({
  tabs,
  tab,
  tabLabels,
  tabBadges,
  onTabChange,
  onNavigate,
}: {
  tabs: PartnerTab[];
  tab: PartnerTab;
  tabLabels?: Partial<Record<PartnerTab, string>>;
  tabBadges?: Partial<Record<PartnerTab, number>>;
  onTabChange: (tab: PartnerTab) => void;
  onNavigate?: () => void;
}) {
  return (
    <nav className="partner-nav-scroll" aria-label="Views">
      <div className="partner-nav-section">
        <p className="partner-nav-section-label">Views</p>
        <div className="partner-nav-items">
          {tabs.map((id) => {
            const Icon = TAB_ICONS[id];
            const badge = tabBadges?.[id];
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                className={`partner-nav-item${active ? ' active' : ''}`}
                onClick={() => {
                  onTabChange(id);
                  onNavigate?.();
                }}
              >
                {Icon && (
                  <span className="partner-nav-icon" aria-hidden>
                    <Icon size={16} />
                  </span>
                )}
                <span className="partner-nav-label">{tabLabels?.[id] ?? DEFAULT_TAB_LABELS[id]}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="partner-nav-badge" aria-label={`${badge} items`}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function SidebarFooter({
  stats,
  sidebarLinks,
}: {
  stats: { label: string; value: number | string }[];
  sidebarLinks?: PartnerShellProps['sidebarLinks'];
}) {
  return (
    <div className="partner-sidebar-footer">
      {sidebarLinks && sidebarLinks.length > 0 && (
        <div className="partner-nav-section">
          <p className="partner-nav-section-label">Quick links</p>
          <div className="partner-nav-items">
            {sidebarLinks.map((link) => (
              <a
                key={link.href}
                className="partner-nav-item partner-nav-link"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.icon && <span className="partner-nav-icon">{link.icon}</span>}
                <span className="partner-nav-label">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="partner-nav-section">
        <p className="partner-nav-section-label">Status</p>
        <dl className="partner-sidebar-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function MainContent({
  embed,
  title,
  subtitle,
  topActions,
  stats,
  toolbar,
  children,
  footer,
  loading,
  isMobile,
  onOpenNav,
}: {
  embed: boolean;
  title: string;
  subtitle: string;
  topActions?: ReactNode;
  stats: { label: string; value: number | string }[];
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  isMobile: boolean;
  onOpenNav?: () => void;
}) {
  return (
    <div className={embed ? 'partner-main partner-main-embed' : 'partner-main'}>
      {loading && (
        <div className="partner-loading-bar" role="progressbar" aria-label="Loading" aria-busy="true" />
      )}

      {!embed && isMobile && (
        <header className="partner-mobile-header">
          <button type="button" className="partner-menu-btn" aria-label="Open menu" onClick={onOpenNav}>
            <Menu size={20} />
          </button>
          <span className="partner-mobile-header-title">{title}</span>
        </header>
      )}

      <div className="partner-page-shell">
        <header className="partner-topbar">
          <div className="partner-topbar-text">
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          {topActions && <div className="partner-actions">{topActions}</div>}
        </header>

        <div className="partner-mobile-stats">
          {stats.map((stat) => (
            <span key={stat.label} className="partner-stat-chip">
              {stat.label}
              <strong>{stat.value}</strong>
            </span>
          ))}
        </div>

        {toolbar}
        {children}
        {footer}
      </div>
    </div>
  );
}

export function PartnerShell({
  theme,
  brandIcon,
  appName,
  tagline,
  tab,
  onTabChange,
  tabs = ['workspace', 'installed'],
  stats,
  tabLabels,
  tabBadges,
  loading,
  topActions,
  title,
  subtitle,
  toolbar,
  children,
  footer,
  embed = false,
  sidebarLinks,
}: PartnerShellProps) {
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, navOpen]);

  const tabNav = (
    <SidebarNav
      tabs={tabs}
      tab={tab}
      tabLabels={tabLabels}
      tabBadges={tabBadges}
      onTabChange={onTabChange}
    />
  );

  if (embed) {
    return (
      <div className="partner-app partner-app-embed" data-theme={theme}>
        <header className="partner-embed-bar">
          <SidebarBrand brandIcon={brandIcon} appName={appName} tagline={tagline} />
          <div className="partner-embed-nav">{tabNav}</div>
        </header>
        <MainContent
          embed
          title={title}
          subtitle={subtitle}
          topActions={topActions}
          stats={stats}
          toolbar={toolbar}
          footer={footer}
          loading={loading}
          isMobile={false}
        >
          {children}
        </MainContent>
      </div>
    );
  }

  return (
    <div className="partner-app" data-theme={theme}>
      {isMobile && navOpen && (
        <button
          type="button"
          className="partner-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`partner-sidebar${isMobile ? ' partner-sidebar-drawer' : ''}${
          isMobile && navOpen ? ' open' : ''
        }`}
      >
        <SidebarBrand
          brandIcon={brandIcon}
          appName={appName}
          tagline={tagline}
          onCloseMobile={isMobile ? () => setNavOpen(false) : undefined}
        />
        <SidebarNav
          tabs={tabs}
          tab={tab}
          tabLabels={tabLabels}
          tabBadges={tabBadges}
          onTabChange={onTabChange}
          onNavigate={() => setNavOpen(false)}
        />
        <SidebarFooter stats={stats} sidebarLinks={sidebarLinks} />
      </aside>

      <MainContent
        embed={false}
        title={title}
        subtitle={subtitle}
        topActions={topActions}
        stats={stats}
        toolbar={toolbar}
        footer={footer}
        loading={loading}
        isMobile={isMobile}
        onOpenNav={() => setNavOpen(true)}
      >
        {children}
      </MainContent>
    </div>
  );
}
