import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { suggestOwnersForAnomaly } from '../lib/workflowGlue';
import type { Anomaly } from '../types';

interface AssignOwnerPromptProps {
  anomaly: Anomaly;
  onAssign: (ownerId: string, ownerName: string, squad: string) => void;
}

export function AssignOwnerPrompt({ anomaly, onAssign }: AssignOwnerPromptProps) {
  const [open, setOpen] = useState(false);
  const owners = suggestOwnersForAnomaly(anomaly);

  if (anomaly.assignedOwner) {
    return (
      <p className="text-xs text-flex-muted mt-2">
        Owner: <span className="text-slate-300">{anomaly.assignedOwner}</span>
        {anomaly.assignedSquad && (
          <span className="text-flex-muted"> · {anomaly.assignedSquad} (dhub-rpt)</span>
        )}
      </p>
    );
  }

  if (anomaly.severity !== 'critical') return null;

  return (
    <div className="mt-3 pt-3 border-t border-flex-border/30">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-flex-warning/10 text-flex-warning border border-flex-warning/30 hover:bg-flex-warning/20"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Assign owner from squad context
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-flex-muted">
            dhub-rpt squad owners — not a meeting invite
          </p>
          {owners.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onAssign(o.id, o.name, o.squad);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg border border-flex-border/40 hover:border-flex-accent/30 hover:bg-flex-surface/40 text-sm"
            >
              <span className="font-medium">{o.name}</span>
              <span className="block text-xs text-flex-muted">
                {o.squad} · {o.dhubRole}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-flex-muted hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
