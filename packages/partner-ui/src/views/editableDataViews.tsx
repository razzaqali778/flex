import type { PartnerLocalContext } from '../partnerLocalContext';
import { Field, patchRow, SelectInput, TextInput } from './editableFields';

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function pct(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

type RecordsProps = {
  records: Record<string, unknown>[];
  onChange: (records: Record<string, unknown>[]) => void;
};

export function EditableKpiView({ records, onChange }: RecordsProps) {
  const row = records[0] ?? {};
  const set = (key: string, raw: string) => {
    const num = Number(raw);
    onChange(patchRow(records, 0, { [key]: Number.isFinite(num) ? num : raw }));
  };
  if (!records.length) {
    return <p className="data-empty">No rows — re-read from Flex first.</p>;
  }
  return (
    <div className="edit-record-grid edit-record-grid-1">
      <Field label="Total spend (USD)">
        <TextInput type="number" value={String(row.totalSpend ?? '')} onChange={(v) => set('totalSpend', v)} />
      </Field>
      <Field label="Spend change %">
        <TextInput type="number" value={String(row.spendChange ?? '')} onChange={(v) => set('spendChange', v)} />
      </Field>
      <Field label="Utilization %">
        <TextInput type="number" value={String(row.utilization ?? '')} onChange={(v) => set('utilization', v)} />
      </Field>
      <Field label="Open anomalies">
        <TextInput type="number" value={String(row.openAnomalies ?? '')} onChange={(v) => set('openAnomalies', v)} />
      </Field>
      <p className="edit-hint">Preview: {fmtUsd(Number(row.totalSpend) || 0)} total spend</p>
    </div>
  );
}

export function EditableChargebackView({
  records,
  onChange,
  local,
}: RecordsProps & { local: PartnerLocalContext }) {
  const initiatives = local.kind === 'eztrac' ? local.initiatives : [];
  return (
    <div className="edit-record-list">
      {records.map((r, i) => {
        const spend = Number(r.monthlySpend) || 0;
        const budget = Number(r.budget) || 0;
        const variance = budget > 0 ? ((spend - budget) / budget) * 100 : 0;
        const patch = (key: string, value: string) => {
          const numKeys = ['monthlySpend', 'budget'];
          onChange(
            patchRow(records, i, {
              [key]: numKeys.includes(key) ? Number(value) || 0 : value,
            })
          );
        };
        const initId = String(r.initiative ?? '');
        const linked = initiatives.find(
          (x) => initId && x.initiativeId.includes(initId.replace('INIT-', '').slice(0, 8))
        );
        return (
          <article key={String(r.id ?? i)} className="edit-record-card">
            <header>
              <strong>{String(r.team ?? r.id ?? `Row ${i + 1}`)}</strong>
              <span className={variance > 0 ? 'text-warn' : 'text-ok'}>
                Variance {variance >= 0 ? '+' : ''}
                {variance.toFixed(1)}%
              </span>
            </header>
            <div className="edit-record-grid">
              <Field label="Team">
                <TextInput value={String(r.team ?? '')} onChange={(v) => patch('team', v)} />
              </Field>
              <Field label="Monthly spend">
                <TextInput type="number" value={String(r.monthlySpend ?? '')} onChange={(v) => patch('monthlySpend', v)} />
              </Field>
              <Field label="Budget">
                <TextInput type="number" value={String(r.budget ?? '')} onChange={(v) => patch('budget', v)} />
              </Field>
              <Field label="Owner">
                <TextInput value={String(r.owner ?? '')} onChange={(v) => patch('owner', v)} />
              </Field>
              {local.kind === 'eztrac' && (
                <p className="edit-hint">
                  Initiative: {linked ? linked.initiativeName : 'Unmapped — map in EzTrac after send'}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function EditableAnomalyView({ records, onChange }: RecordsProps) {
  return (
    <div className="edit-record-list">
      {records.map((r, i) => {
        const patch = (key: string, value: string) => onChange(patchRow(records, i, { [key]: value }));
        const patchNum = (key: string, value: string) =>
          onChange(patchRow(records, i, { [key]: Number(value) || 0 }));
        return (
          <article key={String(r.id ?? i)} className="edit-record-card">
            <header>
              <code className="edit-id">{String(r.id ?? `row-${i}`)}</code>
              <SelectInput
                value={String(r.status ?? 'open')}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'investigating', label: 'Investigating' },
                  { value: 'resolved', label: 'Resolved (sends resolve to Flex)' },
                ]}
                onChange={(v) => patch('status', v)}
              />
            </header>
            <div className="edit-record-grid">
              <Field label="Title">
                <TextInput value={String(r.title ?? '')} onChange={(v) => patch('title', v)} />
              </Field>
              <Field label="Severity">
                <SelectInput
                  value={String(r.severity ?? 'medium')}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                  onChange={(v) => patch('severity', v)}
                />
              </Field>
              <Field label="Service">
                <TextInput value={String(r.service ?? '')} onChange={(v) => patch('service', v)} />
              </Field>
              <Field label="Impact">
                <TextInput value={String(r.impact ?? '')} onChange={(v) => patch('impact', v)} />
              </Field>
              <Field label="Delta %">
                <TextInput type="number" value={String(r.deltaPercent ?? '')} onChange={(v) => patchNum('deltaPercent', v)} />
              </Field>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function EditableResourceView({
  records,
  onChange,
  local,
}: RecordsProps & { local: PartnerLocalContext }) {
  const squads = local.kind === 'dhub' ? local.squads : [];
  return (
    <div className="edit-record-list">
      {records.map((r, i) => {
        const patchNum = (key: string, value: string) =>
          onChange(patchRow(records, i, { [key]: Number(value) || 0 }));
        const patch = (key: string, value: string) => onChange(patchRow(records, i, { [key]: value }));
        const used = Number(r.used) || 0;
        const allocated = Number(r.allocated) || 1;
        const util = pct(used, allocated);
        const team = String(r.team ?? r.name ?? '—');
        const squad = squads.find((s) => team.toLowerCase().includes(s.name.toLowerCase().slice(0, 6)));
        return (
          <article key={String(r.id ?? i)} className="edit-record-card">
            <header>
              <strong>{String(r.name ?? team)}</strong>
              <span>{util}% utilized</span>
            </header>
            <div className="edit-record-grid">
              <Field label="Name">
                <TextInput value={String(r.name ?? '')} onChange={(v) => patch('name', v)} />
              </Field>
              <Field label="Team">
                <TextInput value={String(r.team ?? '')} onChange={(v) => patch('team', v)} />
              </Field>
              <Field label="Used">
                <TextInput type="number" value={String(r.used ?? '')} onChange={(v) => patchNum('used', v)} />
              </Field>
              <Field label="Allocated">
                <TextInput type="number" value={String(r.allocated ?? '')} onChange={(v) => patchNum('allocated', v)} />
              </Field>
              {squad && <p className="edit-hint">Squad: {squad.name}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function EditableGenericView({ records, onChange }: RecordsProps) {
  if (!records.length) return <p className="data-empty">No rows in this import.</p>;
  const keys = [...new Set(records.flatMap((r) => Object.keys(r)))].slice(0, 10);
  return (
    <div className="data-table-wrap">
      <table className="data-table data-table-editable">
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
                <td key={k}>
                  <input
                    className="edit-input edit-input-cell"
                    value={formatCellValue(r[k])}
                    onChange={(e) => onChange(patchRow(records, i, { [k]: e.target.value }))}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
