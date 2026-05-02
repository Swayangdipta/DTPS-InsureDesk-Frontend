import { useParams, useNavigate } from 'react-router-dom';
import { usePolicy }  from '@/hooks/usePolicies';
import Spinner        from '@/components/common/Spinner';
import { PaymentBadge, BondBadge, PayoutBadge, CategoryBadge } from '@/components/common/Badge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import useUIStore      from '@/store/uiStore';

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3
      border-b border-gray-100 dark:border-gray-800 last:border-0 gap-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:w-48 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100 break-words">
        {value ?? <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card overflow-hidden mb-4">
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      </div>
      <div className="px-5 bg-white dark:bg-gray-900">
        {children}
      </div>
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
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm">Policy not found.</p>
        <button onClick={() => navigate('/policies')} className="btn-primary mt-4">
          Back to Policies
        </button>
      </div>
    );
  }

  const accentBorder =
    policy.rowColor === 'green'  ? 'border-l-green-500'  :
    policy.rowColor === 'yellow' ? 'border-l-yellow-500' :
    policy.rowColor === 'red'    ? 'border-l-red-500'    :
    'border-l-brand-500';

  return (
    <div className="max-w-3xl mx-auto space-y-0">

      {/* Page header card */}
      <div className={`card p-5 mb-4 border-l-4 ${accentBorder}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={() => navigate('/policies')}
                className="text-xs text-gray-400 dark:text-gray-500
                  hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                ← Policies
              </button>
              {policy.serialNumber && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  / {policy.serialNumber}
                </span>
              )}
            </div>

            {/* Policyholder name */}
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {policy.policyHolderName}
            </h1>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {policy.category && (
                <CategoryBadge
                  name={policy.category.name}
                  colorCode={policy.category.colorCode}
                />
              )}
              <PaymentBadge status={policy.paymentStatus} />
              <BondBadge    status={policy.bondStatus} />
              <PayoutBadge  status={policy.payoutStatus} />
              {policy.isBookmarked && (
                <span className="badge bg-yellow-100 dark:bg-yellow-900/40
                  text-yellow-700 dark:text-yellow-300">
                  ★ Bookmarked
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => openPolicyModal(policy)}
            className="btn-secondary self-start shrink-0"
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
        <DetailRow label="Policy Issue Date"    value={formatDate(policy.policyIssueDate)} />
        <DetailRow label="Paid Date (DTPS)"     value={formatDate(policy.paidDate)} />
        <DetailRow label="Date of Commencement" value={formatDate(policy.doc)} />
        <DetailRow label="Next Renewal Date"    value={formatDate(policy.nextRenewalDate)} />
      </Section>

      {/* Financials */}
      <Section title="Financial Details">
        <DetailRow label="Premium (without GST)" value={formatCurrency(policy.premiumWithoutGST)} />
        <DetailRow label="Premium (with GST)"    value={formatCurrency(policy.premiumWithGST)} />
        <DetailRow label="Sum Assured"           value={formatCurrency(policy.sumAssured)} />
        <DetailRow
          label="Premium Paying Term"
          value={policy.premiumPayingTerm ? `${policy.premiumPayingTerm} years` : null}
        />
        <DetailRow
          label="Policy Term"
          value={policy.policyTerm ? `${policy.policyTerm} years` : null}
        />
      </Section>

      {/* Advisors */}
      <Section title="Advisors">
        <DetailRow label="Advisor Name"    value={policy.advisorName} />
        <DetailRow label="ADV Level 3"     value={policy.advisorLevel3} />
        <DetailRow label="Top Leader Name" value={policy.advisorLevel4} />
        <DetailRow label="Remarks"         value={policy.remarks} />
      </Section>

    </div>
  );
}
