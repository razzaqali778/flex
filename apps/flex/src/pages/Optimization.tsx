import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Plus, Trash2, X } from 'lucide-react';
import { useFlex } from '../store/FlexContext';
import type { SavingsStage } from '../data/insights';

const stageVariant: Record<SavingsStage, 'neutral' | 'info' | 'warning' | 'success'> = {
  identified: 'neutral',
  approved: 'info',
  implementing: 'warning',
  realized: 'success',
};

const stageOrder: SavingsStage[] = ['identified', 'approved', 'implementing', 'realized'];

export function Optimization() {
  const { savings, advanceSavingsStage, createSavings, dismissSavings } = useFlex();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'compute' as const, monthlySavings: 5000, action: '', owner: 'Platform' });

  const totalIdentified = savings.reduce((s, o) => s + o.monthlySavings, 0);
  const totalRealized = savings.reduce((s, o) => s + (o.realizedSavings ?? 0), 0);
  const realizationPct = totalIdentified > 0 ? Math.round((totalRealized / totalIdentified) * 100) : 0;

  return (
    <div className="page-shell">
      <PageHeader
        title="Cost Optimization"
        description="Create savings opportunities and advance them through the lifecycle."
        action={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-flex-accent/15 text-flex-accent border border-flex-accent/30"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add opportunity'}
          </button>
        }
      />

      {showForm && (
        <div className="glass rounded-xl p-4 mb-6 border border-flex-accent/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm" />
            <input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm" />
            <input type="number" placeholder="Monthly savings ($)" value={form.monthlySavings} onChange={(e) => setForm({ ...form, monthlySavings: Number(e.target.value) })} className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm" />
            <input placeholder="Action" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm" />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                if (!form.title.trim()) return;
                createSavings({
                  title: form.title,
                  category: form.category,
                  monthlySavings: form.monthlySavings,
                  effort: 'medium',
                  confidence: 80,
                  action: form.action || 'TBD',
                  stage: 'identified',
                  owner: form.owner,
                });
                setShowForm(false);
                setForm({ title: '', category: 'compute', monthlySavings: 5000, action: '', owner: 'Platform' });
              }}
              className="px-4 py-2 rounded-lg bg-flex-accent text-flex-bg text-sm font-medium"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-flex-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card border-flex-success">
          <p className="text-sm text-flex-muted">Identified monthly savings</p>
          <p className="font-display text-3xl font-bold text-flex-success mt-1">
            ${(totalIdentified / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="stat-card border-flex-accent">
          <p className="text-sm text-flex-muted">Realized to date</p>
          <p className="font-display text-3xl font-bold mt-1">${(totalRealized / 1000).toFixed(1)}K</p>
        </div>
        <div className="stat-card border-flex-accent2">
          <p className="text-sm text-flex-muted">Realization rate</p>
          <p className="font-display text-3xl font-bold mt-1">{realizationPct}%</p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
        {stageOrder.map((stage) => (
          <div key={stage} className="flex-1 min-w-[80px] text-center">
            <div className={`h-1.5 rounded-full mb-2 ${savings.some((s) => s.stage === stage) ? 'bg-flex-accent' : 'bg-flex-border/40'}`} />
            <p className="text-[10px] uppercase text-flex-muted capitalize">{stage}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {savings.map((s) => (
          <div key={s.id} className="glass rounded-xl p-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <div className="flex gap-2 flex-wrap items-center">
                <p className="font-semibold">{s.title}</p>
                <Badge variant="neutral">{s.category}</Badge>
                <Badge variant={stageVariant[s.stage]}>{s.stage}</Badge>
                <Badge variant="info">{s.effort} effort</Badge>
              </div>
              <p className="text-sm text-flex-muted mt-2">{s.action}</p>
              <p className="text-xs text-flex-muted mt-1">Owner: {s.owner}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end sm:text-right">
              <div>
                <p className="text-xl font-bold text-flex-success">
                  ${(s.monthlySavings / 1000).toFixed(1)}K/mo
                </p>
                <p className="text-xs text-flex-muted">{s.confidence}% confidence</p>
                {s.realizedSavings != null && (
                  <p className="text-xs text-flex-success mt-0.5">
                    ${(s.realizedSavings / 1000).toFixed(1)}K realized
                  </p>
                )}
              </div>
              <div className="card-actions sm:justify-end">
                {s.stage !== 'realized' && (
                  <button
                    type="button"
                    onClick={() => advanceSavingsStage(s.id)}
                    className="btn-outline-accent text-xs"
                  >
                    Advance stage →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissSavings(s.id)}
                  className="btn-outline-danger text-xs px-2"
                  aria-label="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

