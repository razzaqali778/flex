import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  change?: number;
  icon: LucideIcon;
  accent?: 'cyan' | 'violet' | 'green' | 'amber' | 'red';
}

const accents = {
  cyan: 'from-flex-accent/20 to-flex-accent/5 text-flex-accent',
  violet: 'from-flex-accent2/20 to-flex-accent2/5 text-flex-accent2',
  green: 'from-flex-success/20 to-flex-success/5 text-flex-success',
  amber: 'from-flex-warning/20 to-flex-warning/5 text-flex-warning',
  red: 'from-flex-danger/20 to-flex-danger/5 text-flex-danger',
};

export function KpiCard({ title, value, sub, change, icon: Icon, accent = 'cyan' }: KpiCardProps) {
  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card hover:border-flex-accent/30 transition-colors">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-flex-muted font-medium">{title}</p>
          <p className="font-display text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-flex-muted mt-1">{sub}</p>}
          {change !== undefined && (
            <p
              className={`text-xs mt-2 font-medium ${
                change >= 0 ? 'text-flex-danger' : 'text-flex-success'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${accents[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
