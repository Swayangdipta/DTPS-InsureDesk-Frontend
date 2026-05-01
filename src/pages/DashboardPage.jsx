import { useQuery } from '@tanstack/react-query';
import { Link }     from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi }  from '@/api/analytics.api';
import { SkeletonCard }  from '@/components/common/Skeleton';
import { formatCurrency, formatCompact, formatNumber } from '@/utils/formatters';

function KPICard({ label, value, sub, icon, color = 'brand' }) {
  const colors = {
    brand:  'bg-brand-50  text-brand-600  dark:bg-brand-950 dark:text-brand-400',
    green:  'bg-green-50  text-green-600  dark:bg-green-950 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    red:    'bg-red-50    text-red-600    dark:bg-red-950 dark:text-red-400',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function DashboardPage() {
  const overview   = useQuery({ queryKey: ['analytics-overview'],    queryFn: () => analyticsApi.getOverview().then(r => r.data.data) });
  const byCategory = useQuery({ queryKey: ['analytics-category'],    queryFn: () => analyticsApi.getByCategory().then(r => r.data.data) });
  const timeSeries = useQuery({ queryKey: ['analytics-timeseries'],  queryFn: () => analyticsApi.getTimeSeries({ groupBy: 'month' }).then(r => r.data.data) });
  const byBroker   = useQuery({ queryKey: ['analytics-broker'],      queryFn: () => analyticsApi.getByBroker().then(r => r.data.data) });

  const d = overview.data;

  return (
    <div className="space-y-6">

      {/* KPI Cards — premiumWithoutGST is the primary business number */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KPICard
              label="Total Policies"
              value={formatNumber(d?.totalPolicies ?? 0)}
              sub={`+${d?.thisMonthPolicies ?? 0} this month`}
              icon="📋" color="brand"
            />
            {/* PRIMARY — Total Business = Premium without GST */}
            <KPICard
              label="Total Business (ex-GST)"
              value={formatCompact(d?.totalPremiumNoGST ?? 0)}
              sub="Primary business metric"
              icon="💼" color="green"
            />
            <KPICard
              label="Total Premium (with GST)"
              value={formatCompact(d?.totalPremiumWithGST ?? 0)}
              sub="Including tax"
              icon="💰" color="yellow"
            />
            <KPICard
              label="Monthly Growth"
              value={`${d?.growth ?? 0}%`}
              sub={`${d?.lastMonthPolicies ?? 0} last month`}
              icon="📈" color={d?.growth >= 0 ? 'green' : 'red'}
            />
          </>
        )}
      </div>

      {/* Status breakdown pills */}
      {d?.statusBreakdown && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(d.statusBreakdown).map(([status, count]) => (
            <div key={status} className="card px-4 py-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{status}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Monthly Policy Trend">
            {timeSeries.isLoading ? (
              <div className="h-56 skeleton rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeSeries.data ?? []}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n) => n === 'totalPremiumNoGST' ? formatCurrency(v) : v} />
                  <Legend />
                  <Area type="monotone" dataKey="count"
                    stroke="#6366f1" fill="url(#grad1)"
                    name="Policies" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Section>
        </div>

        <Section title="By Category">
          {byCategory.isLoading ? (
            <div className="h-56 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory.data ?? []} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                  {(byCategory.data ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} policies`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* Charts row 2 — use premiumWithoutGST (totalPremium from analytics = ex-GST) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Broker-wise Business (ex-GST)"
          action={<Link to="/analytics" className="text-xs text-brand-600 hover:underline">View all →</Link>}
        >
          {byBroker.isLoading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={byBroker.data ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="totalPremium" name="Business (ex-GST)" fill="#6366f1" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Category-wise Business (ex-GST)">
          {byCategory.isLoading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={byCategory.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="totalPremium" name="Business (ex-GST)" radius={[4,4,0,0]}>
                  {(byCategory.data ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>
    </div>
  );
}
