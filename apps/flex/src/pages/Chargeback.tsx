import { AlertTriangle, DollarSign, Pencil, Tag, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { useFlex } from '../store/FlexContext';

function fmtUsd(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;
}

export function Chargeback() {
  const { chargeback, tagRules, updateChargeback, updateTagRule } = useFlex();
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState('');

  const totalChargebackSpend = chargeback.reduce((s, r) => s + r.monthlySpend, 0);
  const totalChargebackBudget = chargeback.reduce((s, r) => s + r.budget, 0);
  const overallTagCompliance = Math.round(
    tagRules.filter((t) => t.required).reduce((s, t) => s + t.coveragePct, 0) /
      Math.max(1, tagRules.filter((t) => t.required).length)
  );
  const untaggedSpendTotal = tagRules.reduce((s, t) => s + t.untaggedSpend, 0);

  const variance = totalChargebackSpend - totalChargebackBudget;
  const variancePct = ((variance / totalChargebackBudget) * 100).toFixed(1);

  const cancelBudgetEdit = useCallback(() => {
    setEditBudgetId(null);
    setBudgetDraft('');
  }, []);

  const startBudgetEdit = (id: string, budget: number) => {
    setEditBudgetId(id);
    setBudgetDraft(String(budget));
  };

  const saveBudget = (id: string) => {
    const n = Number(budgetDraft);
    if (!Number.isNaN(n) && n > 0) updateChargeback(id, { budget: n });
    cancelBudgetEdit();
  };

  useEffect(() => {
    if (!editBudgetId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelBudgetEdit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editBudgetId, cancelBudgetEdit]);

  return (
    <div className="page-shell">
      <PageHeader
        title="Chargeback & Showback"
        description="Click a budget to edit inline — changes persist in demo state."
      />

      <div className="stat-grid">
        <div className="stat-card border-flex-accent">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Total allocated spend</p>
          <p className="font-display text-3xl font-bold mt-1">{fmtUsd(totalChargebackSpend)}</p>
        </div>
        <div className="stat-card border-flex-accent2">
          <p className="text-xs text-flex-muted uppercase tracking-wider">Budget</p>
          <p className="font-display text-3xl font-bold mt-1">{fmtUsd(totalChargebackBudget)}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${variance > 0 ? 'text-flex-warning' : 'text-flex-success'}`}>
            {variance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {variance > 0 ? '+' : ''}
            {variancePct}% vs budget
          </p>
        </div>
        <div className="stat-card border-flex-warning">
          <p className="text-xs text-flex-muted uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Tag compliance
          </p>
          <p className="font-display text-3xl font-bold mt-1">{overallTagCompliance}%</p>
          <p className="text-xs text-flex-muted mt-1">{fmtUsd(untaggedSpendTotal)} untagged</p>
        </div>
      </div>

      <section className="mb-10">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-flex-accent" />
          Team showback
        </h3>
        <div className="md:hidden space-y-3 mb-4">
          {chargeback.map((row) => {
            const over = row.monthlySpend > row.budget;
            const editing = editBudgetId === row.id;
            return (
              <div key={row.id} className="glass rounded-xl p-4 text-sm">
                <p className="font-medium">{row.team}</p>
                <p className="text-xs text-flex-muted mt-0.5">{row.costCenter} · {row.owner}</p>
                <dl className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <dt className="text-flex-muted">Spend</dt>
                    <dd className={`font-semibold ${over ? 'text-flex-warning' : 'text-flex-success'}`}>
                      {fmtUsd(row.monthlySpend)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-flex-muted">Budget</dt>
                    <dd>
                      {editing ? (
                        <input
                          type="number"
                          autoFocus
                          value={budgetDraft}
                          onChange={(e) => setBudgetDraft(e.target.value)}
                          className="input-field py-1 text-xs"
                        />
                      ) : (
                        <button type="button" onClick={() => startBudgetEdit(row.id, row.budget)} className="hover:text-flex-accent">
                          {fmtUsd(row.budget)}
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
                {editing && (
                  <div className="form-actions mt-2">
                    <button type="button" onClick={() => saveBudget(row.id)} className="btn-outline-accent text-xs py-1">
                      Save
                    </button>
                    <button type="button" onClick={cancelBudgetEdit} className="btn-outline text-xs py-1">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="hidden md:block glass rounded-2xl overflow-x-auto table-scroll">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-flex-border/60 text-left text-flex-muted">
                <th className="p-4">Team</th>
                <th className="p-4">Initiative</th>
                <th className="p-4">Spend</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Forecast</th>
                <th className="p-4">$/engineer</th>
                <th className="p-4">Tags</th>
              </tr>
            </thead>
            <tbody>
              {chargeback.map((row) => {
                const over = row.monthlySpend > row.budget;
                const editing = editBudgetId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-flex-border/30 hover:bg-flex-surface/30 ${
                      editing ? 'bg-flex-accent/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <p className="font-medium">{row.team}</p>
                      <p className="text-xs text-flex-muted">
                        {row.costCenter} · {row.owner}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-xs">{row.initiative}</td>
                    <td className={`p-4 font-semibold ${over ? 'text-flex-warning' : 'text-flex-success'}`}>
                      {fmtUsd(row.monthlySpend)}
                    </td>
                    <td className="p-4">
                      {editing ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="number"
                            autoFocus
                            value={budgetDraft}
                            onChange={(e) => setBudgetDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveBudget(row.id);
                              if (e.key === 'Escape') cancelBudgetEdit();
                            }}
                            className="w-28 px-2 py-1 rounded bg-flex-surface border border-flex-accent/40 text-xs"
                            aria-label={`Budget for ${row.team}`}
                          />
                          <button
                            type="button"
                            onClick={() => saveBudget(row.id)}
                            className="text-xs font-medium text-flex-accent px-2 py-1 rounded hover:bg-flex-accent/10"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelBudgetEdit}
                            className="text-xs text-flex-muted hover:text-slate-200 px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startBudgetEdit(row.id, row.budget)}
                          className="inline-flex items-center gap-1 hover:text-flex-accent group"
                          title="Click to edit budget"
                        >
                          {fmtUsd(row.budget)}
                          <Pencil className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                        </button>
                      )}
                    </td>
                    <td className="p-4">{fmtUsd(row.forecast)}</td>
                    <td className="p-4">{fmtUsd(row.costPerEngineer)}</td>
                    <td className="p-4">
                      <Badge variant={row.tagCompliance >= 90 ? 'success' : 'warning'}>
                        {row.tagCompliance}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-flex-warning" />
          Tag compliance rules
        </h3>
        <div className="space-y-3">
          {tagRules.map((rule) => (
            <div
              key={rule.id}
              className="glass rounded-xl p-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div>
                <p className="font-medium font-mono">{rule.tag}</p>
                <p className="text-xs text-flex-muted">
                  Owner: {rule.owner} · {rule.required ? 'Required' : 'Optional'}
                </p>
              </div>
              <label className="text-xs text-flex-muted flex items-center gap-3 sm:justify-end">
                <span>Coverage</span>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={rule.coveragePct}
                  onChange={(e) => updateTagRule(rule.id, { coveragePct: Number(e.target.value) })}
                  className="w-32 accent-flex-accent"
                />
                <span className="font-bold text-slate-200 w-10 text-right">{rule.coveragePct}%</span>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
