import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, X, XCircle } from 'lucide-react';
import { buildOutcomeNotification } from '../lib/workflowGlue';
import {
  formatOutcomeMessage,
  formatOutcomePreview,
  simulateOutcomeNotify,
} from '../lib/slackNotify';
import { notifyExtension, syncWorkflowNotification } from '../lib/extensionBridge';
import type { DataRequest } from '../types';

interface ApprovalOutcomeNotificationProps {
  request: DataRequest;
  outcome: 'approved' | 'rejected';
  onDismiss: () => void;
}

export function ApprovalOutcomeNotification({
  request,
  outcome,
  onDismiss,
}: ApprovalOutcomeNotificationProps) {
  const [slackSent, setSlackSent] = useState(false);
  const [sending, setSending] = useState(false);
  const built = buildOutcomeNotification(request, outcome);
  const { target, appLabel, desktopTitle, desktopBody } = built;

  const slackPayload = {
    outcome,
    dataset: request.dataset,
    fromApp: appLabel,
    recordCount: request.recordCount,
    channel: target.channel,
    audienceLabel: target.label,
  };

  useEffect(() => {
    notifyExtension(desktopTitle, desktopBody);
    syncWorkflowNotification({
      ...built.record,
      at: new Date().toISOString(),
      slackSent: false,
    });
    // Fire once per approve/reject outcome banner
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id, outcome]);

  const notifySlack = async () => {
    setSending(true);
    await simulateOutcomeNotify(slackPayload);
    notifyExtension('Flex — Slack sent', formatOutcomeMessage(slackPayload).slice(0, 120));
    syncWorkflowNotification({
      ...built.record,
      at: new Date().toISOString(),
      slackSent: true,
    });
    setSlackSent(true);
    setSending(false);
  };

  const isApproved = outcome === 'approved';

  return (
    <div
      className={`mb-6 rounded-xl border overflow-hidden ${
        isApproved
          ? 'border-flex-success/40 bg-flex-success/5'
          : 'border-flex-danger/40 bg-flex-danger/5'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${
          isApproved
            ? 'border-flex-success/30 bg-flex-success/10'
            : 'border-flex-danger/30 bg-flex-danger/10'
        }`}
      >
        {isApproved ? (
          <CheckCircle2 className="w-5 h-5 text-flex-success shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-flex-danger shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${isApproved ? 'text-flex-success' : 'text-flex-danger'}`}
          >
            {isApproved ? 'Approved & transferred' : 'Request rejected'}
          </p>
          <p className="text-xs text-flex-muted truncate">
            {request.dataset} · {appLabel} · {request.recordCount.toLocaleString()} records
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-flex-muted hover:text-slate-200 shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-start gap-2 text-xs text-flex-muted">
          <Bell className="w-4 h-4 text-flex-accent2 shrink-0 mt-0.5" />
          <p>
            Desktop notification sent. Notify <strong className="text-slate-300">{target.label}</strong>{' '}
            on Slack (#{target.channel}) — workflow glue, not a calendar invite.
          </p>
        </div>

        <div className="rounded-lg border border-flex-border/50 bg-flex-bg/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-flex-border/40 bg-flex-surface/40">
            <MessageSquare className="w-3.5 h-3.5 text-flex-accent2" />
            <span className="text-[10px] uppercase tracking-wider text-flex-muted">
              Slack preview · #{target.channel}
            </span>
          </div>
          <pre className="p-3 text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
            {formatOutcomePreview(slackPayload)}
          </pre>
        </div>

        <div className="flex flex-wrap gap-2">
          {!slackSent ? (
            <button
              type="button"
              disabled={sending}
              onClick={() => void notifySlack()}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-flex-accent2/15 text-flex-accent2 border border-flex-accent2/30 hover:bg-flex-accent2/25 disabled:opacity-50"
            >
              {sending ? 'Sending…' : `Notify ${target.audience} on Slack`}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-flex-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Slack notification sent to #{target.channel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

