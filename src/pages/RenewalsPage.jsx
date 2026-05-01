import { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import { useRenewals } from '@/hooks/usePolicies';
import { CategoryBadge, PaymentBadge } from '@/components/common/Badge';
import Spinner   from '@/components/common/Spinner';
import { formatDate, formatCurrency, daysUntil } from '@/utils/formatters';

function UrgencyBadge({ days }) {
  if (days <= 7)  return <span className="badge bg-red-100    text-red-700">🔴 {days}d left</span>;
  if (days <= 30) return <span className="badge bg-yellow-100 text-yellow-700">🟡 {days}d left</span>;
  return               <span className="badge bg-blue-100   text-blue-700">🔵 {days}d left</span>;
}

function RenewalCard({ policy }) {
  const navigate = useNavigate();
  const days = daysUntil(policy.nextRenewalDate);

  return (
    <div
      onClick={() => navigate(`/policies/${policy._id}`)}
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4
        border-l-brand-400 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {policy.policyHolderName}
          </p>
          {policy.category && (
            <CategoryBadge name={policy.category.name} colorCode={policy.category.colorCode} />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span>{policy.company?.name ?? '—'}</span>
          <span>·</span>
          <span>Renewal: {formatDate(policy.nextRenewalDate)}</span>
          <span>·</span>
          <span>{formatCurrency(policy.premiumWithGST)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PaymentBadge status={policy.paymentStatus} />
        {days !== null && <UrgencyBadge days={days} />}
      </div>
    </div>
  );
}

function GroupSection({ title, policies, emptyMsg, accent }) {
  if (!policies.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`w-2 h-2 rounded-full ${accent}`} />
        <h2 className="text-sm font-semibold text-gray-800">
          {title}
          <span className="ml-2 text-gray-400 font-normal">({policies.length})</span>
        </h2>
      </div>
      <div className="space-y-2 mb-6">
        {policies.map((p) => <RenewalCard key={p._id} policy={p} />)}
      </div>
    </div>
  );
}

export default function RenewalsPage() {
  const [days, setDays] = useState(60);
  const { data, isLoading } = useRenewals(days);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const { urgent = [], soon = [], upcoming = [], total = 0 } = data ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Upcoming Renewals
            <span className="ml-2 text-sm font-normal text-gray-400">({total} total)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Policies due for renewal in the next {days} days</p>
        </div>

        {/* Days range selector */}
        <div className="flex items-center gap-2">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                ${days === d
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'}`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center border-l-4 border-red-400">
          <p className="text-2xl font-bold text-gray-900">{urgent.length}</p>
          <p className="text-xs text-gray-500 mt-1">Urgent (≤7 days)</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-yellow-400">
          <p className="text-2xl font-bold text-gray-900">{soon.length}</p>
          <p className="text-xs text-gray-500 mt-1">Soon (8–30 days)</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-blue-400">
          <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
          <p className="text-xs text-gray-500 mt-1">Upcoming (30+ days)</p>
        </div>
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-sm">No renewals due in the next {days} days.</p>
        </div>
      )}

      {/* Grouped lists */}
      <GroupSection
        title="Urgent — Due within 7 days"
        policies={urgent}
        accent="bg-red-500"
      />
      <GroupSection
        title="Soon — Due within 30 days"
        policies={soon}
        accent="bg-yellow-500"
      />
      <GroupSection
        title="Upcoming — Due within 60 days"
        policies={upcoming}
        accent="bg-blue-500"
      />
    </div>
  );
}
