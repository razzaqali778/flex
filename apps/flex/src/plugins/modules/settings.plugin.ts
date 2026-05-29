import { ROLE_LABELS } from '../../lib/rbac';
import { consumeRows, definePlugin } from '../definePlugin';

export const settingsPlugin = definePlugin({
  manifest: {
    id: 'flex.settings',
    name: 'Settings',
    version: '1.0.0',
    description: 'RBAC role, demo modes, and extension preferences',
    route: '/settings',
    category: 'tools',
    capabilities: { consume: true, produce: true, events: false },
    datasets: [
      {
        name: 'preferences',
        description: 'User role and UI toggles',
        schema: ['userRole', 'slackApprovals', 'presentationMode', 'meetingMode', 'spendPulse', 'desktopNotifications'],
        direction: 'bidirectional',
      },
      {
        name: 'role_catalog',
        description: 'Available RBAC roles and labels',
        schema: ['role', 'label'],
        direction: 'outbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(settingsPlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'role_catalog') {
        return (Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((role) => ({
          role,
          label: ROLE_LABELS[role],
        }));
      }
      return [state.settings];
    }),
  produce: (_state, req) => {
    const patch = req.records[0] as Record<string, unknown> | undefined;
    if (!patch || req.dataset !== 'preferences') {
      return {
        ok: false,
        pluginId: 'flex.settings',
        dataset: req.dataset,
        message: 'Send preferences dataset with one record',
        error: 'VALIDATION',
      };
    }
    return {
      ok: true,
      pluginId: 'flex.settings',
      dataset: req.dataset,
      message: `Preferences update accepted: ${Object.keys(patch).join(', ')}`,
    };
  },
});
