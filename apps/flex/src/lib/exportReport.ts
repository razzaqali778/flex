import type { FlexState } from '../store/flexTypes';
import { totalIdentifiedSavings, savingsOpportunities } from '../data/insights';

export function buildExecutiveReport(state: {
  kpis: FlexState['kpis'];
  pendingCount: number;
  transferLog: FlexState['transferLog'];
  openAnomalies: number;
}): string {
  const { kpis, pendingCount, transferLog, openAnomalies } = state;
  const lines = [
    '# Flex FinOps — Executive Snapshot',
    `_Generated ${new Date().toLocaleString()}_`,
    '',
    '## KPIs',
    `- **Cloud spend:** $${(kpis.totalSpend / 1000).toFixed(1)}K (${kpis.spendChange}% vs prior)`,
    `- **Utilization:** ${kpis.utilization}%`,
    `- **Active resources:** ${kpis.activeResources.toLocaleString()}`,
    `- **Open anomalies:** ${openAnomalies}`,
    `- **Pending approvals:** ${pendingCount}`,
    '',
    '## Identified savings',
    `- **Monthly opportunity:** $${(totalIdentifiedSavings / 1000).toFixed(1)}K`,
    ...savingsOpportunities.slice(0, 4).map(
      (s) => `- ${s.title}: $${(s.monthlySavings / 1000).toFixed(1)}K/mo (${s.confidence}% confidence)`
    ),
    '',
    '## Recent transfers',
    ...transferLog.slice(0, 6).map((t) => `- [${t.status}] ${t.message}`),
    '',
    '## Integrations',
    '- **EzTrac** — finance forecasting (bidirectional)',
    '- **dhub-rpt** — resource planning (bidirectional)',
    '',
    '_Flex · formerly FinOps · Demo report_',
  ];
  return lines.join('\n');
}

export async function copyReportToClipboard(markdown: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch {
    return false;
  }
}

export function downloadReport(markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flex-finops-report-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
