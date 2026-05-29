/**
 * Route table is the runtime source of truth (unchanged for compatibility).
 * Frontend plugins in `plugins/frontend/features` mirror these paths for nav/search.
 * @see createFlexApp({ features }) — Backstage-style extension model
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GovernanceLayout } from './components/GovernanceLayout';
import { Dashboard } from './pages/Dashboard';
import { CloudUsage } from './pages/CloudUsage';
import { Resources } from './pages/Resources';
import { Anomalies } from './pages/Anomalies';
import { DataExchange } from './pages/DataExchange';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Plugins } from './pages/Plugins';
import { AIAssistant } from './pages/AIAssistant';
import { Alignment } from './pages/Alignment';
import { Optimization } from './pages/Optimization';
import { Chargeback } from './pages/Chargeback';
import { Workforce } from './pages/Workforce';
import { PartnerConsole } from './pages/PartnerConsole';
import { PartnerAppLayout } from './components/PartnerAppLayout';
import { EzTracApp } from './pages/partner-apps/EzTracApp';
import { DhubRptApp } from './pages/partner-apps/DhubRptApp';

export default function App() {
  const partnerMode = import.meta.env.VITE_PARTNER_APP;

  if (partnerMode === 'eztrac' || partnerMode === 'dhub-rpt') {
    return (
      <Routes>
        <Route element={<PartnerAppLayout lockedPartner={partnerMode} />}>
          <Route path="*" element={partnerMode === 'eztrac' ? <EzTracApp /> : <DhubRptApp />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="apps" element={<PartnerAppLayout />}>
        <Route path="eztrac" element={<EzTracApp />} />
        <Route path="dhub-rpt" element={<DhubRptApp />} />
        <Route index element={<Navigate to="eztrac" replace />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="govern" element={<GovernanceLayout />}>
          <Route path="exchange" element={<DataExchange />} />
          <Route path="partners" element={<Integrations />} />
          <Route path="alignment" element={<Alignment />} />
          <Route index element={<Navigate to="exchange" replace />} />
        </Route>
        <Route path="exchange" element={<Navigate to="/govern/exchange" replace />} />
        <Route path="integrations" element={<Navigate to="/govern/partners" replace />} />
        <Route path="alignment" element={<Navigate to="/govern/alignment" replace />} />
        <Route path="cloud" element={<CloudUsage />} />
        <Route path="optimization" element={<Optimization />} />
        <Route path="chargeback" element={<Chargeback />} />
        <Route path="workforce" element={<Workforce />} />
        <Route path="resources" element={<Resources />} />
        <Route path="anomalies" element={<Anomalies />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="plugins" element={<Plugins />} />
        <Route path="partner" element={<PartnerConsole />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
