import usePolicyStore from '@/store/policyStore';
import useMasterStore  from '@/store/masterStore';

const LABELS = {
  category:        'Category',
  brokerHouse:     'Broker',
  company:         'Company',
  paymentStatus:   'Payment',
  bondStatus:      'Bond',
  payoutStatus:    'Payout',
  advisorName:     'Advisor',
  advisorLevel4:   'Top Leader',   // #6 display rename
  isBookmarked:    'Bookmarked',
  issueDateFrom:   'Issue From',
  issueDateTo:     'Issue To',
  paidDateFrom:    'Paid From',
  paidDateTo:      'Paid To',
  renewalDateFrom: 'Renewal From',
  renewalDateTo:   'Renewal To',
  premiumMin:      'Premium ≥',
  premiumMax:      'Premium ≤',
};

export default function FilterChips() {
  const { filters, setFilter, resetFilters, activeFilterCount } = usePolicyStore();
  const { categories, brokerHouses, companies } = useMasterStore();

  const count = activeFilterCount();
  if (count === 0) return null;

  const resolveValue = (key, val) => {
    if (key === 'category')    return categories.find((c)   => c._id === val)?.name   ?? val;
    if (key === 'brokerHouse') return brokerHouses.find((b) => b._id === val)?.name   ?? val;
    if (key === 'company')     return companies.find((c)    => c._id === val)?.name   ?? val;
    if (key === 'isBookmarked') return 'Yes';
    if (key.startsWith('premium')) return `₹${val}`;
    return val;
  };

  const activeFilters = Object.entries(filters).filter(
    ([, v]) => v !== '' && v !== false && v !== null
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(([key, val]) => (
        <span key={key} className="filter-chip">
          <span className="text-gray-500 dark:text-gray-400">{LABELS[key] ?? key}:</span>
          <span className="ml-0.5">{resolveValue(key, String(val))}</span>
          <button
            onClick={() => setFilter(key, '')}
            className="ml-1 text-brand-500 hover:text-brand-800 font-bold leading-none"
            aria-label={`Remove ${key} filter`}
          >×</button>
        </span>
      ))}

      {count > 1 && (
        <button
          onClick={resetFilters}
          className="text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
