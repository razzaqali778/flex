import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { cloudUsageHistory, forecastData, serviceBreakdown } from '../data/mockData';

export function CloudUsage() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Cloud Usage"
        description="Multi-dimensional usage across compute, storage, network, and database — publishable to EzTrac and dhub-rpt."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card min-w-0">
          <h3 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Usage by category ($K)
          </h3>
          <div className="chart-h w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cloudUsageHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} width={36} />
                <Tooltip
                  contentStyle={{
                    background: '#1a2332',
                    border: '1px solid #2d3a4f',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="compute" fill="#22d3ee" name="Compute" radius={[4, 4, 0, 0]} />
                <Bar dataKey="database" fill="#818cf8" name="Database" radius={[4, 4, 0, 0]} />
                <Bar dataKey="storage" fill="#34d399" name="Storage" radius={[4, 4, 0, 0]} />
                <Bar dataKey="network" fill="#fbbf24" name="Network" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card min-w-0">
          <h3 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Forecast vs actual vs budget
          </h3>
          <div className="chart-h w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  width={40}
                  tickFormatter={(v) => `$${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a2332',
                    border: '1px solid #2d3a4f',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  name="Actual"
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#818cf8"
                  strokeWidth={2}
                  name="Forecast"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  name="Budget"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
        <h3 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Service allocation mix
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {serviceBreakdown.map((s) => (
            <div
              key={s.name}
              className="p-3 sm:p-4 rounded-xl border border-flex-border/50 text-center"
              style={{ borderColor: `${s.color}40` }}
            >
              <p
                className="text-2xl sm:text-3xl font-display font-bold"
                style={{ color: s.color }}
              >
                {s.value}%
              </p>
              <p className="text-xs sm:text-sm text-flex-muted mt-1">{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
