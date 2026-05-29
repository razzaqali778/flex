import type { PluginImport } from './pluginImport';
import type { PartnerAppId, PartnerLocalContext } from './partnerLocalContext';
import { resolveViewKind } from './viewRegistry';

export interface WorkspaceInsight {
  id: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  detail: string;
  actionLabel?: string;
}

function latestImport(imports: PluginImport[], kinds: string[]): PluginImport | undefined {
  for (const imp of imports) {
    if (kinds.includes(resolveViewKind(imp))) return imp;
  }
  return undefined;
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function buildWorkspaceInsights(
  appId: PartnerAppId,
  imports: PluginImport[],
  local: PartnerLocalContext
): WorkspaceInsight[] {
  const insights: WorkspaceInsight[] = [];

  if (imports.length === 0) {
    insights.push({
      id: 'empty',
      tone: 'info',
      title: 'No Flex data imported yet',
      detail:
        appId === 'eztrac'
          ? 'Install plugins, then Read chargeback or KPIs to feed your forecast and initiative views.'
          : 'Install plugins, then Read allocation or squad data to update your capacity board.',
    });
    return insights;
  }

  if (appId === 'eztrac' && local.kind === 'eztrac') {
    const chargeback = latestImport(imports, ['chargeback']);
    if (chargeback) {
      const rows = chargeback.records;
      const overBudget = rows.filter((r) => num(r.monthlySpend) > num(r.budget)).length;
      const totalSpend = rows.reduce((s, r) => s + num(r.monthlySpend), 0);
      const totalBudget = rows.reduce((s, r) => s + num(r.budget), 0);
      const variancePct = totalBudget > 0 ? ((totalSpend - totalBudget) / totalBudget) * 100 : 0;

      insights.push({
        id: 'cb-variance',
        tone: overBudget > 0 ? 'warning' : 'success',
        title: `${overBudget} team(s) over monthly budget`,
        detail: `Cloud chargeback total $${(totalSpend / 1000).toFixed(1)}K vs budget $${(totalBudget / 1000).toFixed(1)}K (${variancePct >= 0 ? '+' : ''}${variancePct.toFixed(1)}%). Map teams to initiatives in EzTrac VIP.`,
        actionLabel: 'Map to initiatives',
      });

      const unmatched = rows.filter((r) => {
        const init = String(r.initiative ?? '');
        return init && !local.initiatives.some((i) => init.includes(i.initiativeId.replace('INIT-', '').split('-')[0] ?? ''));
      });
      if (unmatched.length > 0) {
        insights.push({
          id: 'cb-initiative',
          tone: 'info',
          title: 'Initiative linkage',
          detail: `${unmatched.length} chargeback row(s) may need initiative mapping in VIP before forecast roll-up.`,
        });
      }
    }

    const anomalies = latestImport(imports, ['anomalies']);
    if (anomalies) {
      const critical = anomalies.records.filter((r) => r.severity === 'critical' || r.severity === 'high').length;
      if (critical > 0) {
        insights.push({
          id: 'anomaly-risk',
          tone: 'danger',
          title: `${critical} high-severity cost signal(s)`,
          detail: 'Adjust risk-adjusted forecast in EzTrac reporting or send variance notes back to Flex.',
          actionLabel: 'Flag in forecast',
        });
      }
    }

    const consumption = latestImport(imports, ['consumption']);
    if (consumption) {
      const active = consumption.records.filter((r) => r.status === 'consuming').length;
      insights.push({
        id: 'consumption',
        tone: 'info',
        title: `${active} Flex dataset(s) in use`,
        detail: 'These match your expected inbound feeds for finance forecasting.',
      });
    }
  }

  if (appId === 'rpt' && local.kind === 'dhub') {
    const resources = latestImport(imports, ['resources']);
    if (resources) {
      const overUtil = resources.records.filter((r) => num(r.used) > num(r.allocated)).length;
      const avgUtil =
        resources.records.length > 0
          ? resources.records.reduce((s, r) => {
              const alloc = num(r.allocated) || 1;
              return s + num(r.used) / alloc;
            }, 0) / resources.records.length
          : 0;

      insights.push({
        id: 'util',
        tone: overUtil > 0 ? 'warning' : 'success',
        title: `${overUtil} resource(s) over allocated capacity`,
        detail: `Average utilization ${(avgUtil * 100).toFixed(0)}% across ${resources.records.length} rows. Compare with ${local.overAllocatedSquads} over-allocated squad(s) in dhub.`,
        actionLabel: 'Update capacity board',
      });
    }

    const workforce = latestImport(imports, ['workforce']);
    if (workforce) {
      insights.push({
        id: 'squad',
        tone: 'info',
        title: 'Squad matrix synced from Flex',
        detail: `Reconcile ${workforce.records.length} squad row(s) with ${local.squads.length} active squads in dhub-rpt.`,
      });
    }

    const alignment = latestImport(imports, ['alignment']);
    if (alignment) {
      const conflicts = alignment.records.filter((r) => r.status === 'conflict').length;
      if (conflicts > 0) {
        insights.push({
          id: 'align',
          tone: 'warning',
          title: `${conflicts} alignment conflict(s)`,
          detail: 'Resolve in Flex or open transfer requests in dhub for capacity mismatches.',
        });
      }
    }
  }

  return insights;
}
