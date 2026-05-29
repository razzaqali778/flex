import { cloudUsageHistory, forecastData } from '../../data/mockData';
import { consumeRows, definePlugin } from '../definePlugin';

export const cloudUsagePlugin = definePlugin({
  manifest: {
    id: 'flex.cloud-usage',
    name: 'Cloud usage & forecast',
    version: '1.0.0',
    description: 'Spend breakdown, forecast vs budget',
    route: '/cloud',
    category: 'cost',
    capabilities: { consume: true, produce: false, events: true },
    datasets: [
      {
        name: 'usage_history',
        description: 'Monthly usage by category',
        schema: ['date', 'compute', 'storage', 'network', 'database'],
        direction: 'outbound',
      },
      {
        name: 'forecast_slices',
        description: 'Actual vs forecast vs budget by month',
        schema: ['month', 'actual', 'forecast', 'budget'],
        direction: 'outbound',
      },
    ],
  },
  consume: (state, dataset) =>
    consumeRows(cloudUsagePlugin.manifest, state, dataset, (ds) => {
      if (ds.name === 'forecast_slices') return forecastData;
      return cloudUsageHistory;
    }),
});
