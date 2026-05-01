import usePolicyStore from '@/store/policyStore';
import useMasterStore  from '@/store/masterStore';
import useUIStore      from '@/store/uiStore';

const STATUS_OPTIONS = {
  paymentStatus: ['Paid', 'Unpaid', 'Bounced', 'Partial'],
  bondStatus:    ['Pending', 'Received', 'Dispatched', 'NA'],
  payoutStatus:  ['Due', 'Paid', 'NA'],
};

export default function FilterDrawer() {
  const { filterDrawerOpen, setFilterDrawerOpen } = useUIStore();
  const { filters, setFilter, resetFilters }      = usePolicyStore();
  const { categories, brokerHouses, getCompaniesByBroker } = useMasterStore();

  const companies = getCompaniesByBroker(filters.brokerHouse);

  const handleReset = () => { resetFilters(); setFilterDrawerOpen(false); };

  const StatusPills = ({ filterKey, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(filterKey, filters[filterKey] === s ? '' : s)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition
            ${filters[filterKey] === s
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-brand-400'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setFilterDrawerOpen(false)} />
      )}

      <aside className={`
        fixed top-0 right-0 h-full w-80 z-40 flex flex-col
        bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${filterDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select className="select" value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Broker House */}
          <div>
            <label className="label">Broker House</label>
            <select className="select" value={filters.brokerHouse}
              onChange={(e) => { setFilter('brokerHouse', e.target.value); setFilter('company', ''); }}>
              <option value="">All brokers</option>
              {brokerHouses.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="label">Company</label>
            <select className="select" value={filters.company}
              onChange={(e) => setFilter('company', e.target.value)}
              disabled={!filters.brokerHouse}>
              <option value="">All companies</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="label">Payment Status</label>
            <StatusPills filterKey="paymentStatus" options={STATUS_OPTIONS.paymentStatus} />
          </div>

          {/* Bond Status */}
          <div>
            <label className="label">Bond Status</label>
            <StatusPills filterKey="bondStatus" options={STATUS_OPTIONS.bondStatus} />
          </div>

          {/* Payout Status */}
          <div>
            <label className="label">Payout Status</label>
            <StatusPills filterKey="payoutStatus" options={STATUS_OPTIONS.payoutStatus} />
          </div>

          {/* Advisor Name */}
          <div>
            <label className="label">Advisor Name</label>
            <input className="input" placeholder="Search advisor..."
              value={filters.advisorName}
              onChange={(e) => setFilter('advisorName', e.target.value)} />
          </div>

          {/* Top Leader Name (advisorLevel4) */}
          <div>
            <label className="label">Top Leader Name</label>
            <input className="input" placeholder="Search top leader..."
              value={filters.advisorLevel4}
              onChange={(e) => setFilter('advisorLevel4', e.target.value)} />
          </div>

          {/* Issue Date Range */}
          <div>
            <label className="label">Issue Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input text-xs" value={filters.issueDateFrom}
                onChange={(e) => setFilter('issueDateFrom', e.target.value)} />
              <input type="date" className="input text-xs" value={filters.issueDateTo}
                onChange={(e) => setFilter('issueDateTo', e.target.value)} />
            </div>
          </div>

          {/* Paid Date Range */}
          <div>
            <label className="label">Paid Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input text-xs" value={filters.paidDateFrom}
                onChange={(e) => setFilter('paidDateFrom', e.target.value)} />
              <input type="date" className="input text-xs" value={filters.paidDateTo}
                onChange={(e) => setFilter('paidDateTo', e.target.value)} />
            </div>
          </div>

          {/* Renewal Date Range */}
          <div>
            <label className="label">Renewal Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input text-xs" value={filters.renewalDateFrom}
                onChange={(e) => setFilter('renewalDateFrom', e.target.value)} />
              <input type="date" className="input text-xs" value={filters.renewalDateTo}
                onChange={(e) => setFilter('renewalDateTo', e.target.value)} />
            </div>
          </div>

          {/* Premium Range (ex-GST) */}
          <div>
            <label className="label">Premium Range ex-GST (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className="input text-xs" placeholder="Min"
                value={filters.premiumMin}
                onChange={(e) => setFilter('premiumMin', e.target.value)} />
              <input type="number" className="input text-xs" placeholder="Max"
                value={filters.premiumMax}
                onChange={(e) => setFilter('premiumMax', e.target.value)} />
            </div>
          </div>

          {/* Bookmarked */}
          <div className="flex items-center gap-3">
            <input id="bookmarked" type="checkbox" className="w-4 h-4 accent-brand-600"
              checked={filters.isBookmarked === 'true'}
              onChange={(e) => setFilter('isBookmarked', e.target.checked ? 'true' : '')} />
            <label htmlFor="bookmarked" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Bookmarked only
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button onClick={handleReset} className="btn-secondary flex-1 justify-center">Reset</button>
          <button onClick={() => setFilterDrawerOpen(false)} className="btn-primary flex-1 justify-center">Apply</button>
        </div>
      </aside>
    </>
  );
}
