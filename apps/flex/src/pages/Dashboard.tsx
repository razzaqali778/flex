import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, DollarSign, GitCompareArrows, Shield } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { NeedsAttention } from '../components/NeedsAttention';
import { DashboardHub } from '../components/DashboardHub';
import { cloudUsageHistory, serviceBreakdown } from '../data/mockData';
import { useFlex } from '../store/FlexContext';

export function Dashboard() {
  const { kpis, pendingCount, alignmentScore } = useFlex();

  const usageTotal = cloudUsageHistory.map((d) => ({
    ...d,
    total: d.compute + d.storage + d.network + d.database,
  }));

  return (
    <div className="page-shell">
      <PageHeader
        title="Dashboard"
        description="Spend, alignment, and what needs attention."
      />

      <NeedsAttention />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <KpiCard
          title="Total Cloud Spend"
          value={`$${(kpis.totalSpend / 1000).toFixed(1)}K`}
          change={kpis.spendChange}
          icon={DollarSign}
          accent="cyan"
        />
        <KpiCard
          title="Utilization"
          value={`${kpis.utilization}%`}
          sub="Across allocated resources"
          icon={Activity}
          accent="green"
        />
        <KpiCard
          title="Cross-app alignment"
          value={`${alignmentScore}%`}
          sub="Flex · EzTrac · dhub-rpt"
          icon={GitCompareArrows}
          accent="violet"
        />
        <KpiCard
          title="Pending Approvals"
          value={String(pendingCount)}
          sub="→ Governance hub"
          icon={Shield}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex justify-between mb-3">
            <h3 className="font-display font-semibold text-sm sm:text-base">Cloud usage trend</h3>
            <Link to="/cloud" className="text-xs text-flex-accent hover:underline">
              Full analysis →
            </Link>
          </div>
          <div className="chart-h w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageTotal}>
                <defs>
                  <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a2332',
                    border: '1px solid #2d3a4f',
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#22d3ee"
                  fill="url(#usageGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex justify-between mb-3">
            <h3 className="font-display font-semibold text-sm sm:text-base">Spend by service</h3>
            <Link to="/optimization" className="text-xs text-flex-success hover:underline">
              Savings →
            </Link>
          </div>
          <div className="space-y-4">
            {serviceBreakdown.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.name}</span>
                  <span className="text-flex-muted">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-flex-surface overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.value}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DashboardHub />
    </div>
  );
}
