import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Download, Eye, Plus, Send, Trash2, X, CheckCircle2, Users } from 'lucide-react';
import { ApprovalImpactModal } from '../components/ApprovalImpactModal';
import { ApprovalOutcomeNotification } from '../components/ApprovalOutcomeNotification';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { Badge } from '../components/Badge';
import { TransferActivity } from '../components/TransferActivity';
import { FieldBoundaryModal } from '../components/FieldBoundaryModal';
import { useGovernanceEmbedded } from '../hooks/useGovernanceEmbedded';
import { simulateApprovalImpact } from '../lib/approvalImpact';
import { useFlex } from '../store/FlexContext';
import type { DataRequest, PublishedDataset } from '../types';

const appLabels = { eztrac: 'EzTrac', 'dhub-rpt': 'dhub-rpt (RTP)' };

export function DataExchange() {
  const {
    dataRequests,
    publishedDatasets,
    transferLog,
    kpis,
    approveRequest,
    rejectRequest,
    publishDataset,
    unpublishDataset,
    createDataset,
    archiveDataRequest,
    pendingCount,
    lastActionError,
    lastSyncMessage,
    settings,
  } = useFlex();

  const location = useLocation();
  const embedded = useGovernanceEmbedded();
  const [previewRequest, setPreviewRequest] = useState<DataRequest | null>(null);
  const [publishPreview, setPublishPreview] = useState<PublishedDataset | null>(null);
  const [publishFlash, setPublishFlash] = useState<string | null>(null);
  const [notifyPrompt, setNotifyPrompt] = useState<{
    request: DataRequest;
    outcome: 'approved' | 'rejected';
  } | null>(null);
  const [showCreateDataset, setShowCreateDataset] = useState(false);
  const [newDataset, setNewDataset] = useState({ name: '', description: '', schema: 'field1,field2' });

  const pending = dataRequests.filter((r) => r.status === 'pending');
  const history = dataRequests.filter((r) => r.status !== 'pending');

  useEffect(() => {
    const previewId = (location.state as { previewRequestId?: string } | null)?.previewRequestId;
    if (!previewId) return;
    const req = dataRequests.find((r) => r.id === previewId && r.status === 'pending');
    if (req) setPreviewRequest(req);
    window.history.replaceState({}, document.title);
  }, [location.state, dataRequests]);

  const impact = previewRequest ? simulateApprovalImpact(previewRequest, kpis) : null;

  const confirmApprove = () => {
    if (!previewRequest) return;
    const req = previewRequest;
    if (!approveRequest(req.id)) return;
    setPreviewRequest(null);
    setNotifyPrompt({ request: req, outcome: 'approved' });
  };

  return (
    <div className={embedded ? undefined : 'page-shell'}>
      {!embedded && (
        <PageHeader
          title="Data Exchange Hub"
          description="Review partner inbound requests, approve or reject, then publish datasets outbound."
          action={
            pendingCount > 0 ? (
              <Badge variant="warning">{pendingCount} awaiting approval</Badge>
            ) : undefined
          }
        />
      )}

      {notifyPrompt && (
        <ApprovalOutcomeNotification
          request={notifyPrompt.request}
          outcome={notifyPrompt.outcome}
          onDismiss={() => setNotifyPrompt(null)}
        />
      )}

      {publishFlash && (
        <div className="alert-banner border-flex-success/40 bg-flex-success/10 text-flex-success mb-6">
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {publishFlash}
          </p>
        </div>
      )}

      {lastActionError && (
        <div className="mb-6 p-4 rounded-xl border border-flex-danger/40 bg-flex-danger/10 text-sm text-flex-danger">
          {lastActionError}
        </div>
      )}

      <p className="text-xs text-flex-muted mb-4">
        Role: <span className="text-flex-accent capitalize">{settings.userRole}</span> — RBAC enforced on approve & publish
      </p>

      {lastSyncMessage && (
        <div className="mb-4 p-3 rounded-xl border border-flex-success/30 bg-flex-success/10 text-sm text-flex-success">
          {lastSyncMessage}
        </div>
      )}

      <section className="section-block">
        <SectionHeader
          icon={Download}
          title="Inbound requests"
          action={
            pendingCount > 0 ? (
              <Badge variant="warning">{pendingCount} awaiting approval</Badge>
            ) : undefined
          }
        />
        <p className="text-sm text-flex-muted mb-4">
          EzTrac and dhub-rpt sends appear here as pending. Each send increases the Governance notification badge.
        </p>
        {pending.length === 0 ? (
          <EmptyState title="No pending requests">
            Send from a partner app, then refresh on Partner apps — requests show up here automatically.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div
                key={r.id}
                className="glass rounded-xl p-4 sm:p-5 border-l-4 border-flex-warning"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.dataset}</p>
                    <p className="text-sm text-flex-muted mt-1">
                      From <Badge variant="info">{appLabels[r.fromApp]}</Badge> ·{' '}
                      {r.recordCount.toLocaleString()} records
                    </p>
                    <p className="text-sm mt-2 break-words">{r.purpose}</p>
                    <p className="text-xs text-flex-muted mt-1">
                      {new Date(r.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="card-actions lg:flex-col lg:items-stretch lg:min-w-[160px]">
                    <button
                      type="button"
                      onClick={() => setPreviewRequest(r)}
                      className="btn-outline-success flex-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Reject inbound request for "${r.dataset}" from ${appLabels[r.fromApp]}?`
                          )
                        ) {
                          return;
                        }
                        if (!rejectRequest(r.id)) return;
                        setNotifyPrompt({ request: r, outcome: 'rejected' });
                      }}
                      className="btn-outline-danger flex-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewRequest(r)}
                      className="btn-outline-accent flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview impact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <SectionHeader title="Request history" />
        <div className="md:hidden space-y-2 mb-4">
          {history.map((r) => (
            <div key={r.id} className="glass rounded-xl p-3 text-sm">
              <p className="font-mono text-xs">{r.dataset}</p>
              <p className="text-flex-muted mt-1">{appLabels[r.fromApp]} · {r.recordCount} records</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant={r.status === 'approved' ? 'success' : 'danger'}>{r.status}</Badge>
                <button
                  type="button"
                  onClick={() => archiveDataRequest(r.id)}
                  className="text-xs text-flex-muted hover:text-flex-danger"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="table-scroll hidden md:block">
          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-flex-border/60 text-left text-flex-muted">
                  <th className="p-3">Dataset</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Records</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b border-flex-border/30">
                    <td className="p-3 font-mono text-xs">{r.dataset}</td>
                    <td className="p-3">{appLabels[r.fromApp]}</td>
                    <td className="p-3">{r.recordCount}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === 'approved' ? 'success' : 'danger'}>
                          {r.status}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => archiveDataRequest(r.id)}
                          className="p-1 text-flex-muted hover:text-flex-danger"
                          aria-label="Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          icon={Send}
          title="Published datasets (outbound)"
          action={
            <button
              type="button"
              onClick={() => setShowCreateDataset(!showCreateDataset)}
              className="btn-outline-accent text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCreateDataset ? 'Cancel' : 'New dataset'}
            </button>
          }
        />
        {showCreateDataset && (
          <div className="glass rounded-xl p-4 mb-4 border border-flex-accent/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Dataset name" value={newDataset.name} onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })} className="input-field" />
              <input placeholder="Schema (comma-separated)" value={newDataset.schema} onChange={(e) => setNewDataset({ ...newDataset, schema: e.target.value })} className="input-field" />
              <input placeholder="Description" value={newDataset.description} onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })} className="input-field sm:col-span-2" />
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  if (!newDataset.name.trim()) return;
                  createDataset({
                    name: newDataset.name,
                    description: newDataset.description || 'Custom dataset',
                    schema: newDataset.schema.split(',').map((s) => s.trim()).filter(Boolean),
                    consumers: [],
                    recordCount: 0,
                  });
                  setNewDataset({ name: '', description: '', schema: 'field1,field2' });
                  setShowCreateDataset(false);
                }}
                className="px-4 py-2 rounded-lg bg-flex-accent text-flex-bg text-sm font-medium"
              >
                Create draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateDataset(false);
                  setNewDataset({ name: '', description: '', schema: 'field1,field2' });
                }}
                className="px-4 py-2 rounded-lg text-sm text-flex-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {publishedDatasets.map((d) => (
            <div key={d.id} className="glass rounded-2xl p-5 shadow-card">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div>
                  <p className="font-semibold font-mono text-sm">{d.name}</p>
                  <Badge variant={d.status === 'active' ? 'success' : 'neutral'} className="mt-2">
                    {d.status}
                  </Badge>
                </div>
                {d.status === 'draft' && (
                  <button
                    type="button"
                    onClick={() => setPublishPreview(d)}
                    className="px-3 py-1.5 rounded-lg bg-flex-accent2/20 text-flex-accent2 border border-flex-accent2/40 text-xs font-medium hover:bg-flex-accent2/30 shrink-0"
                  >
                    Review & publish
                  </button>
                )}
                {d.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => unpublishDataset(d.id)}
                    className="px-3 py-1.5 rounded-lg bg-flex-warning/15 text-flex-warning border border-flex-warning/30 text-xs font-medium shrink-0"
                  >
                    Unpublish
                  </button>
                )}
              </div>
              <p className="text-sm text-flex-muted mt-3">{d.description}</p>
              {d.consumers.length > 0 ? (
                <p className="text-xs mt-2 flex items-center gap-1.5 text-flex-accent">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  Consumed by {d.consumers.map((c) => appLabels[c as keyof typeof appLabels] ?? c).join(' · ')}
                </p>
              ) : d.status === 'draft' ? (
                <p className="text-xs mt-2 text-flex-warning">Not yet consumed — publish to deliver to EzTrac / dhub-rpt</p>
              ) : null}
              {d.lastPublished && (
                <p className="text-xs text-flex-muted mt-1">
                  Last sent: {new Date(d.lastPublished).toLocaleString()} ·{' '}
                  {d.recordCount.toLocaleString()} rows
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 pt-8 border-t border-flex-border/50">
        <h3 className="font-display font-semibold text-lg mb-2">Audit trail</h3>
        <p className="text-xs text-flex-muted mb-4">
          Only place for transfer history — not repeated on Dashboard or Integrations.
        </p>
        <TransferActivity entries={transferLog} limit={10} />
      </section>

      {previewRequest && impact && (
        <ApprovalImpactModal
          request={previewRequest}
          impact={impact}
          onConfirm={confirmApprove}
          onClose={() => setPreviewRequest(null)}
        />
      )}

      {publishPreview && (
        <FieldBoundaryModal
          dataset={publishPreview}
          onConfirm={() => {
            if (publishDataset(publishPreview.id)) {
              setPublishFlash(`Published ${publishPreview.name} — undo available for 8s.`);
              setTimeout(() => setPublishFlash(null), 4000);
            }
            setPublishPreview(null);
          }}
          onClose={() => setPublishPreview(null)}
        />
      )}
    </div>
  );
}
