import type { FlexPluginDefinition } from '../../types';
import { jiraPlugin } from './jira.plugin';
import { pagerdutyPlugin } from './pagerduty.plugin';
import { snowflakePlugin } from './snowflake.plugin';
import { teamsPlugin } from './teams.plugin';

/** Third-party marketplace extension bundles only (core plugins live in corePlugins.ts) */
export const EXTENSION_BUNDLES: Record<string, FlexPluginDefinition> = {
  [pagerdutyPlugin.manifest.id]: pagerdutyPlugin,
  [teamsPlugin.manifest.id]: teamsPlugin,
  [snowflakePlugin.manifest.id]: snowflakePlugin,
  [jiraPlugin.manifest.id]: jiraPlugin,
};

export function getExtensionBundle(id: string): FlexPluginDefinition | undefined {
  return EXTENSION_BUNDLES[id];
}

export { jiraPlugin, pagerdutyPlugin, snowflakePlugin, teamsPlugin };
