import { useParams, useNavigate } from 'react-router-dom';
import { usePolicy }  from '@/hooks/usePolicies';
import Spinner        from '@/components/common/Spinner';
import { PaymentBadge, BondBadge, PayoutBadge, CategoryBadge } from '@/components/common/Badge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { getRowClass } from '@/utils/rowColor';
import useUIStore      from '@/store/uiStore';

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0 gap-1">
      <span className="text-xs font-medium text-gray-500 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card overflow-hidden mb-4">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export default function PolicyDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { openPolicyModal } = useUIStore();
  const { data: policy, isLoading, isError } = usePolicy(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !policy) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>Policy not found.</p>
        <button onClick={() => navigate('/policies')} className="btn-primary mt-4">
          Back to Policies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-0">
      {/* Page header */}
      <div className={`card p-5 mb-4 border-l-4 ${
        policy.rowColor === 'green'  ? 'border-green-500'  :
        policy.rowColor === 'yellow' ? 'border-yellow-500' :
        policy.rowColor === 'red'    ? 'border-red-500'    :
        'border-brand-500'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate('/policies')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ← Policies
              </button>
              {policy.serialNumber && (
                <span className="text-xs text-gray-400">/ {policy.serialNumber}</span>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900">{policy.policyHolderName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {policy.category && (
                <CategoryBadge name={policy.category.name} colorCode={policy.category.colorCode} />
              )}
              <PaymentBadge status={policy.paymentStatus} />
              <BondBadge    status={policy.bondStatus} />
              <PayoutBadge  status={policy.payoutStatus} />
              {policy.isBookmarked && (
                <span className="badge bg-yellow-100 text-yellow-700">★ Bookmarked</span>
              )}
            </div>
          </div>

          <button
            onClick={() => openPolicyModal(policy)}
            className="btn-secondary self-start"
          >
            ✎ Edit
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <DetailRow label="Policyholder Name" value={policy.policyHolderName} />
        <DetailRow label="Serial Number"     value={policy.serialNumber} />
        <DetailRow label="Broker House"      value={policy.brokerHouse?.name} />
        <DetailRow label="Company"           value={policy.company?.name} />
        <DetailRow label="Issued Month"      value={policy.issuedMonth} />
        <DetailRow label="System Update"     value={policy.systemUpdateStatus} />
        <DetailRow label="Created By"        value={policy.createdBy?.fullName} />
        <DetailRow label="Created At"        value={formatDate(policy.createdAt, 'DD MMM YYYY, HH:mm')} />
      </Section>

      {/* Dates */}
      <Section title="Dates">
        <DetailRow label="Policy Issue Date" value={formatDate(policy.policyIssueDate)} />
        <DetailRow label="Paid Date (DTPS)"  value={formatDate(policy.paidDate)} />
        <DetailRow label="Date of Commencement" value={formatDate(policy.doc)} />
        <DetailRow label="Next Renewal Date" value={formatDate(policy.nextRenewalDate)} />
      </Section>

      {/* Financials */}
      <Section title="Financial Details">
        <DetailRow label="Premium (without GST)" value={formatCurrency(policy.premiumWithoutGST)} />
        <DetailRow label="Premium (with GST)"    value={formatCurrency(policy.premiumWithGST)} />
        <DetailRow label="Sum Assured"           value={formatCurrency(policy.sumAssured)} />
        <DetailRow label="Premium Paying Term"   value={policy.premiumPayingTerm ? `${policy.premiumPayingTerm} years` : null} />
        <DetailRow label="Policy Term"           value={policy.policyTerm ? `${policy.policyTerm} years` : null} />
      </Section>

      {/* Advisors */}
      <Section title="Advisors">
        <DetailRow label="Advisor Name"    value={policy.advisorName} />
        <DetailRow label="ADV Level 3"     value={policy.advisorLevel3} />
        <DetailRow label="Top Leader Name"     value={policy.advisorLevel4} />
        <DetailRow label="Remarks"         value={policy.remarks} />
      </Section>
    </div>
  );
}
