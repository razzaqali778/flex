import type { PartnerLocalContext } from '../partnerLocalContext';

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function pct(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

function cell(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function ReadKpiView({ records }: { records: Record<string, unknown>[] }) {
  const row = records[0] ?? {};
  if (!records.length) return <p className="data-empty">No rows — read again from Flex.</p>;

  const items = [
    { label: 'Total spend', value: fmtUsd(Number(row.totalSpend) || 0) },
    { label: 'Spend change', value: `${Number(row.spendChange) || 0}%` },
    { label: 'Utilization', value: `${Number(row.utilization) || 0}%` },
    { label: 'Open anomalies', value: String(row.openAnomalies ?? '—') },
  ];

  return (
    <div className="data-kpi-grid">
      {items.map((item) => (
        <div key={item.label} className="data-kpi-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ReadChargebackView({
  records,
  local,
}: {
  records: Record<string, unknown>[];
  local: PartnerLocalContext;
}) {
  if (!records.length) return <p className="data-empty">No rows.</p>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Spend</th>
            <th>Budget</th>
            <th>Variance</th>
            {local.kind === 'eztrac' && <th>Initiative</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => {
            const spend = Number(r.monthlySpend) || 0;
            const budget = Number(r.budget) || 0;
            const variance = budget > 0 ? ((spend - budget) / budget) * 100 : 0;
            return (
              <tr key={String(r.id ?? i)} className={variance > 5 ? 'row-warn' : undefined}>
                <td>{cell(r.team ?? r.id)}</td>
                <td>{fmtUsd(spend)}</td>
                <td>{fmtUsd(budget)}</td>
                <td className={variance > 0 ? 'text-warn' : 'text-ok'}>
                  {variance >= 0 ? '+' : ''}
                  {variance.toFixed(1)}%
                </td>
                {local.kind === 'eztrac' && <td>{cell(r.initiative)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ReadAnomalyView({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p className="data-empty">No anomalies.</p>;

  return (
    <ul className="data-anomaly-list">
      {records.map((r, i) => (
        <li key={String(r.id ?? i)}>
          <div className="data-anomaly-head">
            <strong>{cell(r.title)}</strong>
            <span className={`badge severity-${String(r.severity ?? 'medium')}`}>
              {cell(r.severity)}
            </span>
          </div>
          <p>
            {cell(r.service)} · {cell(r.status)} · Δ {cell(r.deltaPercent)}%
          </p>
          <p>{cell(r.impact)}</p>
        </li>
      ))}
    </ul>
  );
}

export function ReadResourceView({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p className="data-empty">No rows.</p>;

  return (
    <div className="data-resource-list">
      {records.map((r, i) => {
        const used = Number(r.used) || 0;
        const allocated = Number(r.allocated) || 1;
        const util = pct(used, allocated);
        const over = used > allocated;
        return (
          <div key={String(r.id ?? i)} className="data-resource-row">
            <div className="data-resource-meta">
              <strong>{cell(r.name ?? r.team)}</strong>
              <span>{cell(r.team)}</span>
              <span className="muted-chip">{util}% used</span>
            </div>
            <div className="data-util-bar">
              <div className="data-util-fill" data-over={over ? 'true' : 'false'} style={{ width: `${util}%` }} />
            </div>
            <span className="data-util-label">
              {used} / {allocated} allocated
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ReadUsageView({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p className="data-empty">No usage data.</p>;

  const amounts = records.map((r) => Number(r.amount ?? r.spend ?? r.value) || 0);
  const max = Math.max(...amounts, 1);

  return (
    <div className="data-usage-chart">
      {records.slice(0, 12).map((r, i) => {
        const amount = amounts[i] ?? 0;
        const label = String(r.month ?? r.period ?? r.label ?? i + 1);
        return (
          <div key={i} className="data-usage-bar">
            <div className="bar-fill" style={{ height: `${Math.max(4, (amount / max) * 100)}%` }} />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReadGenericTableView({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p className="data-empty">No rows.</p>;

  const keys = [...new Set(records.flatMap((r) => Object.keys(r)))].slice(0, 12);

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k}>{cell(r[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReadConsumptionView({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p className="data-empty">No datasets published.</p>;

  return (
    <ul className="data-consumption-list">
      {records.map((r, i) => (
        <li key={String(r.datasetName ?? r.id ?? i)}>
          <strong>{cell(r.datasetName ?? r.name)}</strong>
          <p>
            {cell(r.status)} · {cell(r.recordCount)} records · {cell(r.schema)}
          </p>
        </li>
      ))}
    </ul>
  );
}
