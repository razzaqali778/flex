import { CheckCircle, ChevronDown, ChevronUp, MoreHorizontal, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { AnomalyStoryPanel } from '../components/AnomalyStoryPanel';
import { AssignOwnerPrompt } from '../components/AssignOwnerPrompt';
import { buildAnomalyStory } from '../lib/anomalyStory';
import { useFlex } from '../store/FlexContext';
import type { Anomaly } from '../types';

const severityVariant = {
  critical: 'danger' as const,
  high: 'warning' as const,
  medium: 'info' as const,
  low: 'neutral' as const,
};

const emptyForm = {
  title: '',
  service: 'EC2',
  severity: 'medium' as Anomaly['severity'],
  impact: '',
  deltaPercent: 0,
};

type AnomalyFormState = typeof emptyForm;

function AnomalyFormFields({
  form,
  onChange,
}: {
  form: AnomalyFormState;
  onChange: (next: AnomalyFormState) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
      />
      <input
        placeholder="Service (e.g. EC2)"
        value={form.service}
        onChange={(e) => onChange({ ...form, service: e.target.value })}
        className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
      />
      <select
        value={form.severity}
        onChange={(e) => onChange({ ...form, severity: e.target.value as Anomaly['severity'] })}
        className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
      >
        {(['critical', 'high', 'medium', 'low'] as const).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        placeholder="Impact (e.g. +$5K projected)"
        value={form.impact}
        onChange={(e) => onChange({ ...form, impact: e.target.value })}
        className="px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
      />
    </div>
  );
}

export function Anomalies() {
  const {
    anomalies,
    transferLog,
    resolveAnomaly,
    reopenAnomaly,
    assignAnomalyOwner,
    createAnomaly,
    updateAnomaly,
    deleteAnomaly,
  } = useFlex();
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const createFormRef = useRef<HTMLDivElement>(null);

  const filtered = filter === 'all' ? anomalies : anomalies.filter((a) => a.status === filter);

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const cancelCreate = () => {
    setCreating(false);
    setForm(emptyForm);
  };

  const submitForm = () => {
    if (!form.title.trim()) return;
    if (editId) {
      updateAnomaly(editId, {
        title: form.title,
        service: form.service,
        severity: form.severity,
        impact: form.impact,
      });
      cancelEdit();
    } else {
      createAnomaly({
        title: form.title,
        service: form.service,
        severity: form.severity,
        impact: form.impact || 'Under review',
        detectedAt: new Date().toISOString(),
        status: 'open',
        deltaPercent: form.deltaPercent,
      });
      cancelCreate();
    }
  };

  const startEdit = (a: Anomaly) => {
    setCreating(false);
    setEditId(a.id);
    setForm({
      title: a.title,
      service: a.service,
      severity: a.severity,
      impact: a.impact,
      deltaPercent: a.deltaPercent,
    });
    setExpandedId(null);
  };

  const startCreate = () => {
    if (editId) return;
    cancelEdit();
    setForm(emptyForm);
    setCreating(true);
  };

  useEffect(() => {
    if (creating && createFormRef.current) {
      createFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [creating]);

  return (
    <div className="page-shell">
      <PageHeader
        title="Anomaly Detection"
        description="Create, assign, resolve, and track cost anomalies with incident stories."
        action={
          <button
            type="button"
            disabled={Boolean(editId)}
            onClick={() => (creating ? cancelCreate() : startCreate())}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-flex-accent/15 text-flex-accent border border-flex-accent/30 disabled:opacity-50"
          >
            {creating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {creating ? 'Cancel' : 'New anomaly'}
          </button>
        }
      />

      <div className="page-toolbar">
        <p className="text-xs text-flex-muted">
          {filtered.length} anomaly{filtered.length === 1 ? '' : 'ies'}
          {editId && <span className="text-flex-accent"> · editing</span>}
        </p>
        <div className="filter-chips" role="tablist" aria-label="Filter by status">
          {(['all', 'open', 'investigating', 'resolved'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`filter-chip ${filter === f ? 'filter-chip-active' : 'filter-chip-inactive'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {creating && (
        <div
          ref={createFormRef}
          className="glass rounded-xl p-4 mb-6 border border-flex-accent/30"
        >
          <h4 className="font-medium mb-3">Report new anomaly</h4>
          <AnomalyFormFields form={form} onChange={setForm} />
          <div className="form-actions">
            <button
              type="button"
              onClick={submitForm}
              className="px-4 py-2 rounded-lg bg-flex-accent text-flex-bg text-sm font-medium"
            >
              Create
            </button>
            <button type="button" onClick={cancelCreate} className="px-4 py-2 rounded-lg text-sm text-flex-muted">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {filtered.map((a) => {
          const expanded = expandedId === a.id;
          const editing = editId === a.id;
          const story = buildAnomalyStory(a, transferLog);

          return (
            <div
              key={a.id}
              className={`glass rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card ${
                editing ? 'ring-1 ring-flex-accent/40 border border-flex-accent/30' : ''
              }`}
            >
              {editing ? (
                <div className="inline-edit-panel mt-0 pt-0 border-0">
                  <h4 className="font-medium mb-3">Edit anomaly</h4>
                  <AnomalyFormFields form={form} onChange={setForm} />
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={submitForm}
                      className="px-4 py-2 rounded-lg bg-flex-accent text-flex-bg text-sm font-medium"
                    >
                      Save changes
                    </button>
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm text-flex-muted">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base break-words">{a.title}</h3>
                        <Badge variant={severityVariant[a.severity]}>{a.severity}</Badge>
                        <Badge variant={a.status === 'resolved' ? 'success' : 'warning'}>{a.status}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-flex-muted mt-2">
                        {a.service} · {new Date(a.detectedAt).toLocaleString()}
                      </p>
                      <p className="text-sm mt-2 text-flex-accent break-words">{a.impact}</p>
                      <AssignOwnerPrompt
                        anomaly={a}
                        onAssign={(_id, name, squad) => assignAnomalyOwner(a.id, name, squad)}
                      />
                    </div>
                    <div className="card-actions sm:justify-end w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : a.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-flex-accent/10 text-flex-accent border border-flex-accent/30 text-sm font-medium"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Story
                      </button>
                      {a.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => resolveAnomaly(a.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-flex-success/20 text-flex-success border border-flex-success/40 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => reopenAnomaly(a.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-flex-border"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reopen
                        </button>
                      )}
                      <details className="relative">
                        <summary className="list-none inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-flex-border bg-flex-surface cursor-pointer hover:border-flex-accent/40 [&::-webkit-details-marker]:hidden">
                          <MoreHorizontal className="w-4 h-4" />
                          More
                        </summary>
                        <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] py-1 rounded-lg border border-flex-border bg-flex-bg shadow-lg">
                          <button
                            type="button"
                            onClick={() => startEdit(a)}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-flex-surface"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete anomaly "${a.title}"?`)) deleteAnomaly(a.id);
                            }}
                            className="block w-full text-left px-3 py-2 text-xs text-flex-danger hover:bg-flex-danger/10"
                          >
                            Delete
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>
                  {expanded && <AnomalyStoryPanel phases={story} />}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 glass rounded-xl sm:rounded-2xl p-4 sm:p-6 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <Search className="w-8 h-8 text-flex-muted shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-sm sm:text-base">Correlated with transfers & deploys</p>
          <p className="text-sm text-flex-muted mt-1">
            Publish anomaly_feed in Governance → Exchange so EzTrac risk models stay in sync.
          </p>
        </div>
      </div>
    </div>
  );
}
