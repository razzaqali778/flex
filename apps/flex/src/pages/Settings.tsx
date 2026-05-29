import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, FileJson, Keyboard, Plug, Presentation, RotateCcw, Shield } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useFlex } from '../store/FlexContext';
import { buildExecutiveReport, copyReportToClipboard, downloadReport } from '../lib/exportReport';
import { buildAuditBundle, downloadAuditBundle, downloadAuditMarkdown } from '../lib/auditBundle';
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type UserRole } from '../lib/rbac';
import { isExtensionContext } from '../lib/extensionBridge';

const ROLES: UserRole[] = ['admin', 'finance', 'platform', 'viewer'];

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-flex-muted mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-6 ${className}`}>{children}</div>;
}

export function Settings() {
  const flex = useFlex();
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const openAnomalies = flex.anomalies.filter((a) => a.status !== 'resolved').length;

  const showMsg = (msg: string) => {
    setExportMsg(msg);
    setTimeout(() => setExportMsg(null), 3000);
  };

  const handleCopyReport = async () => {
    const md = buildExecutiveReport({
      kpis: flex.kpis,
      pendingCount: flex.pendingCount,
      transferLog: flex.transferLog,
      openAnomalies,
    });
    const ok = await copyReportToClipboard(md);
    showMsg(ok ? 'Report copied to clipboard' : 'Copy failed');
  };

  return (
    <div className="page-shell max-w-2xl">
      <PageHeader
        title="Settings"
        description="Access, exports, demo modes, and extension preferences."
      />

      {exportMsg && (
        <div className="mb-4 p-3 rounded-lg bg-flex-success/10 border border-flex-success/30 text-sm text-flex-success">
          {exportMsg}
        </div>
      )}

      <Panel className="mb-6 border border-flex-accent/20">
        <p className="text-sm flex flex-wrap items-center gap-2">
          <Plug className="w-4 h-4 text-flex-accent shrink-0" />
          Publish plugins from{' '}
          <Link to="/plugins" className="text-flex-accent hover:underline font-medium">
            Marketplace publisher
          </Link>
          . Connect EzTrac and dhub-rpt under{' '}
          <Link to="/govern/partners" className="text-flex-accent hover:underline font-medium">
            Governance → Partner apps
          </Link>
          .
        </p>
      </Panel>

      <div className="space-y-8">
        <SettingsSection title="Access & security">
          <Panel>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-flex-accent" />
              Role (RBAC-lite)
            </h4>
            <p className="text-sm text-flex-muted mb-4">
              Finance approves EzTrac · Platform approves dhub-rpt.
            </p>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <label
                  key={role}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    flex.settings.userRole === role
                      ? 'border-flex-accent/50 bg-flex-accent/10'
                      : 'border-flex-border/40 hover:bg-flex-surface/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={flex.settings.userRole === role}
                    onChange={() => flex.setUserRole(role)}
                    className="mt-1 accent-flex-accent"
                  />
                  <span>
                    <span className="text-sm font-medium block">{ROLE_LABELS[role]}</span>
                    <span className="text-xs text-flex-muted">{ROLE_DESCRIPTIONS[role]}</span>
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </SettingsSection>

        <SettingsSection title="Demo & presentation">
          <Panel>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Presentation className="w-5 h-5 text-flex-accent2" />
              Live demo modes
            </h4>
            <label className="flex items-center justify-between py-3 border-b border-flex-border/40 gap-4">
              <div>
                <span className="text-sm block">Presentation mode</span>
                <span className="text-xs text-flex-muted">Polished visuals for stakeholder demos</span>
              </div>
              <input type="checkbox" checked={flex.settings.presentationMode} onChange={(e) => flex.setPresentationMode(e.target.checked)} className="w-4 h-4 accent-flex-accent shrink-0" />
            </label>
            <label className="flex items-center justify-between py-3 border-b border-flex-border/40 gap-4">
              <div>
                <span className="text-sm block">Meeting mode</span>
                <span className="text-xs text-flex-muted">Guided checklist on Dashboard — tracks demo progress</span>
              </div>
              <input type="checkbox" checked={flex.settings.meetingMode} onChange={(e) => flex.setMeetingMode(e.target.checked)} className="w-4 h-4 accent-flex-accent shrink-0" />
            </label>
            <label className="flex items-center justify-between py-3 gap-4">
              <div>
                <span className="text-sm block">Spend pulse bar</span>
                <span className="text-xs text-flex-muted">2px budget health indicator at top of viewport</span>
              </div>
              <input type="checkbox" checked={flex.settings.spendPulse} onChange={(e) => flex.setSpendPulse(e.target.checked)} className="w-4 h-4 accent-flex-accent shrink-0" />
            </label>
          </Panel>
          <Panel>
            <h4 className="font-semibold mb-2">Reset demo data</h4>
            <p className="text-sm text-flex-muted mb-4">
              Restore all governance, chargeback, workforce, and alignment data to defaults.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo data to defaults?')) {
                  flex.resetDemoData();
                  showMsg('Demo data reset');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-warning/15 text-flex-warning border border-flex-warning/30 text-sm font-medium hover:bg-flex-warning/25"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to defaults
            </button>
          </Panel>
        </SettingsSection>

        <SettingsSection title="Exports">
          <Panel>
            <h4 className="font-semibold mb-2">Proof-of-governance</h4>
            <p className="text-sm text-flex-muted mb-4">Audit bundle for Finance, Security, Legal.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadAuditBundle(buildAuditBundle(flex, flex.settings.userRole));
                  showMsg('Audit bundle (.json) downloaded');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-accent/15 text-flex-accent border border-flex-accent/30 text-sm font-medium hover:bg-flex-accent/25"
              >
                <FileJson className="w-4 h-4" />
                JSON bundle
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadAuditMarkdown(buildAuditBundle(flex, flex.settings.userRole));
                  showMsg('Audit bundle (.md) downloaded');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm font-medium hover:border-flex-accent/40"
              >
                <Download className="w-4 h-4" />
                Audit .md
              </button>
            </div>
          </Panel>
          <Panel>
            <h4 className="font-semibold mb-4">Executive report</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopyReport()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-accent/15 text-flex-accent border border-flex-accent/30 text-sm font-medium hover:bg-flex-accent/25"
              >
                <Copy className="w-4 h-4" />
                Copy report
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadReport(
                    buildExecutiveReport({
                      kpis: flex.kpis,
                      pendingCount: flex.pendingCount,
                      transferLog: flex.transferLog,
                      openAnomalies,
                    })
                  );
                  showMsg('Report downloaded');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm font-medium hover:border-flex-accent/40"
              >
                <Download className="w-4 h-4" />
                Download .md
              </button>
            </div>
          </Panel>
        </SettingsSection>

        <SettingsSection title="Extension & notifications">
          <Panel>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-flex-accent2" />
              Shortcuts
            </h4>
            <p className="text-sm text-flex-muted mb-3">
              Press <kbd className="text-xs px-1 py-0.5 rounded bg-flex-surface border border-flex-border">?</kbd> for the full list.
            </p>
            <ul className="text-sm space-y-1.5 text-flex-muted">
              <li className="flex justify-between"><span>Command palette</span><span className="font-mono text-xs">⌘K</span></li>
              <li className="flex justify-between"><span>Global search</span><span className="font-mono text-xs">⇧⌘F</span></li>
              <li className="flex justify-between"><span>Go to page</span><span className="font-mono text-xs">G + letter</span></li>
            </ul>
          </Panel>
          <Panel>
            <h4 className="font-semibold mb-4">Notifications</h4>
            <label className="flex items-center justify-between py-3 border-b border-flex-border/40">
              <span className="text-sm">Slack approval notifications (demo)</span>
              <input type="checkbox" checked={flex.settings.slackApprovals} onChange={(e) => flex.setSlackApprovals(e.target.checked)} className="w-4 h-4 accent-flex-accent" />
            </label>
            <label className="flex items-center justify-between py-3 gap-4">
              <div>
                <span className="text-sm block">Desktop notifications</span>
                <span className="text-xs text-flex-muted">
                  {isExtensionContext() ? 'Chrome extension toasts on approve/reject/sync' : 'Available in extension context'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={flex.settings.desktopNotifications}
                onChange={(e) => flex.setDesktopNotifications(e.target.checked)}
                className="w-4 h-4 accent-flex-accent shrink-0"
              />
            </label>
          </Panel>
        </SettingsSection>

        <Panel>
          <h4 className="font-semibold mb-2">About Flex</h4>
          <p className="text-sm text-flex-muted">Version 2.1 · Full CRUD, reactive alignment, meeting mode, governance hub, AI copilot.</p>
        </Panel>
      </div>
    </div>
  );
}
