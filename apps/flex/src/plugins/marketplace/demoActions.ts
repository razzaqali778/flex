/** Default "Try it" consume dataset per marketplace extension */
export const EXTENSION_TRY_DATASET: Record<string, string> = {
  'flex.ext.pagerduty': 'open_incidents',
  'flex.ext.teams': 'channel_config',
  'flex.ext.snowflake': 'export_manifest',
  'flex.ext.jira': 'ticket_candidates',
};

export function tryDatasetForExtension(pluginId: string): string | undefined {
  return EXTENSION_TRY_DATASET[pluginId];
}
