import type { FlexPluginDefinition } from './types';
import {
  alignmentPlugin,
  anomaliesPlugin,
  assistantPlugin,
  chargebackPlugin,
  cloudUsagePlugin,
  dashboardPlugin,
  extensionPlugin,
  governancePlugin,
  integrationsPlugin,
  optimizationPlugin,
  partnerDhubRptPlugin,
  partnerEzTracPlugin,
  resourcesPlugin,
  settingsPlugin,
  workforcePlugin,
} from './modules';

/** Built-in Flex areas — always available, not uninstallable */
export const CORE_PLUGINS: FlexPluginDefinition[] = [
  dashboardPlugin,
  governancePlugin,
  alignmentPlugin,
  integrationsPlugin,
  partnerEzTracPlugin,
  partnerDhubRptPlugin,
  cloudUsagePlugin,
  optimizationPlugin,
  anomaliesPlugin,
  chargebackPlugin,
  workforcePlugin,
  resourcesPlugin,
  settingsPlugin,
  assistantPlugin,
  extensionPlugin,
];
