import type { PluginImport } from './pluginImport';
import { resolveViewKind } from './viewRegistry';

export interface ProducePlan {
  pluginId: string;
  dataset: string;
  records: unknown[];
  label: string;
}

/** Build API produce calls from edited workspace rows. */
export function buildProducePlans(
  imp: PluginImport,
  partner: 'eztrac' | 'dhub-rpt',
  defaultFlexDataset: string
): ProducePlan[] {
  const view = resolveViewKind(imp);
  const plans: ProducePlan[] = [];

  if (view === 'anomalies') {
    for (const row of imp.records) {
      const id = row.id != null ? String(row.id) : '';
      const status = String(row.status ?? 'open').toLowerCase();
      if (!id) continue;
      if (status === 'resolved') {
        plans.push({
          pluginId: 'flex.anomalies',
          dataset: 'resolve_anomaly',
          records: [{ id }],
          label: `Resolve ${id}`,
        });
      } else {
        plans.push({
          pluginId: 'flex.anomalies',
          dataset: 'update_anomaly',
          records: [
            {
              id,
              title: String(row.title ?? '').trim() || 'Updated anomaly',
              severity: String(row.severity ?? 'medium'),
              service: String(row.service ?? 'Unknown'),
              impact: String(row.impact ?? ''),
              deltaPercent: Number(row.deltaPercent) || 0,
            },
          ],
          label: `Update ${id}`,
        });
      }
    }
    return plans;
  }

  if (view === 'chargeback') {
    for (const row of imp.records) {
      const teamId = String(row.id ?? row.team ?? '').trim();
      if (!teamId) continue;
      plans.push({
        pluginId: 'flex.chargeback',
        dataset: 'update_budget',
        records: [
          {
            id: teamId,
            budget: Number(row.budget) || 0,
            owner: String(row.owner ?? '').trim(),
            monthlySpend: Number(row.monthlySpend) || 0,
          },
        ],
        label: `Update budget ${teamId}`,
      });
    }
    return plans;
  }

  if (view === 'resources') {
    plans.push({
      pluginId: 'flex.resources',
      dataset: 'allocation_matrix',
      records: imp.records,
      label: 'Update allocation matrix in Flex',
    });
    return plans;
  }

  if (view === 'workforce') {
    plans.push({
      pluginId: 'flex.workforce',
      dataset: 'squad_matrix',
      records: imp.records,
      label: 'Update squad matrix in Flex',
    });
    return plans;
  }

  if (view === 'requests') {
    for (const row of imp.records) {
      if (String(row.status ?? '').toLowerCase() !== 'pending') continue;
      plans.push({
        pluginId: 'flex.governance',
        dataset: 'inbound_request',
        records: [
          {
            fromApp: partner,
            dataset: String(row.dataset ?? defaultFlexDataset),
            recordCount: Number(row.recordCount) || 100,
            purpose: String(row.purpose ?? row.message ?? `Updated from ${partner}`).trim(),
          },
        ],
        label: 'Inbound request',
      });
    }
    return plans.slice(0, 1);
  }

  if (imp.records.length > 0) {
    plans.push({
      pluginId: 'flex.governance',
      dataset: 'inbound_request',
      records: [
        {
          fromApp: partner,
          dataset: defaultFlexDataset,
          recordCount: imp.records.length,
          purpose: `Workspace export: ${imp.dataset} (${imp.records.length} rows)`,
          payload: imp.records,
        },
      ],
      label: 'Push workspace data',
    });
  }

  return plans;
}
