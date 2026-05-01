import { useState }   from 'react';
import { useQuery }   from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi }  from '@/api/analytics.api';
import { formatCurrency, formatCompact } from '@/utils/formatters';

const COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [groupBy, setGroupBy] = useState('month');

  const byCategory = useQuery({
    queryKey: ['analytics-category'],
    queryFn:  () => analyticsApi.getByCategory().then(r => r.data.data),
  });
  const byBroker = useQuery({
    queryKey: ['analytics-broker'],
    queryFn:  () => analyticsApi.getByBroker().then(r => r.data.data),
  });
  const byCompany = useQuery({
    queryKey: ['analytics-company'],
    queryFn:  () => analyticsApi.getByCompany().then(r => r.data.data),
  });
  const timeSeries = useQuery({
    queryKey: ['analytics-timeseries', groupBy],
    queryFn:  () => analyticsApi.getTimeSeries({ groupBy }).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">

      {/* Time series */}
      <ChartCard title="Policy & Premium Trend">
        {/* GroupBy toggle */}
        <div className="flex gap-2 mb-4">
          {['day','month','year'].map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition
                ${groupBy === g
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'}`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
        {timeSeries.isLoading ? (
          <div className="h-64 skeleton rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeSeries.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }}
                tickFormatter={(v) => formatCompact(v)} />
              <Tooltip formatter={(v, n) => n === 'totalPremium' ? formatCurrency(v) : v} />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="count"
                stroke="#6366f1" strokeWidth={2} dot={false} name="Policies" />
              <Line yAxisId="right" type="monotone" dataKey="totalPremium"
                stroke="#10b981" strokeWidth={2} dot={false} name="Premium" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Row: pie + bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <ChartCard title="Category Distribution">
          {byCategory.isLoading ? (
            <div className="h-60 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byCategory.data ?? []}
                  dataKey="count" nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={90} innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(byCategory.data ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} policies`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category premium bar */}
        <ChartCard title="Premium by Category">
          {byCategory.isLoading ? (
            <div className="h-60 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="totalPremium" name="Premium" radius={[4,4,0,0]}>
                  {(byCategory.data ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row: broker + company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broker performance */}
        <ChartCard title="Broker-wise Performance">
          {byBroker.isLoading ? (
            <div className="h-60 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byBroker.data ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="totalPremium" name="Premium" fill="#6366f1" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Company top 10 */}
        <ChartCard title="Top 10 Companies by Premium">
          {byCompany.isLoading ? (
            <div className="h-60 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCompany.data ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="totalPremium" name="Premium" fill="#0ea5e9" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
