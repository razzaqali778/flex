import { CheckCircle2, GitBranch, Search, Shield } from 'lucide-react';
import type { AnomalyStoryPhase } from '../lib/anomalyStory';

const phaseConfig = {
  detected: { icon: Search, color: 'text-flex-danger', bg: 'bg-flex-danger/10' },
  correlated: { icon: GitBranch, color: 'text-flex-warning', bg: 'bg-flex-warning/10' },
  action: { icon: Shield, color: 'text-flex-accent', bg: 'bg-flex-accent/10' },
  resolved: { icon: CheckCircle2, color: 'text-flex-success', bg: 'bg-flex-success/10' },
};

interface AnomalyStoryPanelProps {
  phases: AnomalyStoryPhase[];
}

export function AnomalyStoryPanel({ phases }: AnomalyStoryPanelProps) {
  return (
    <div className="mt-4 pt-4 border-t border-flex-border/40">
      <p className="text-[10px] uppercase tracking-wider text-flex-muted mb-3">Incident story</p>
      <div className="space-y-0">
        {phases.map((phase, idx) => {
          const cfg = phaseConfig[phase.phase];
          const Icon = cfg.icon;
          const isLast = idx === phases.length - 1;
          return (
            <div key={phase.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                {!isLast && <div className="w-px flex-1 bg-flex-border/50 my-1 min-h-[16px]" />}
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium">{phase.title}</p>
                <p className="text-xs text-flex-muted mt-0.5">{new Date(phase.at).toLocaleString()}</p>
                <p className="text-sm text-slate-300 mt-1">{phase.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

