import { useState, useEffect } from 'react';
import { usePolicies }  from '@/hooks/usePolicies';
import usePolicyStore   from '@/store/policyStore';
import useUIStore       from '@/store/uiStore';
import useDebounce      from '@/hooks/useDebounce';
import PolicyTable      from '@/components/policy/PolicyTable';
import PolicyForm       from '@/components/policy/PolicyForm';
import BulkImport       from '@/components/policy/BulkImport';
import FilterDrawer     from '@/components/filters/FilterDrawer';
import FilterChips      from '@/components/filters/FilterChips';
import { exportApi }    from '@/api/analytics.api';
import toast            from 'react-hot-toast';

export default function PoliciesPage() {
  const { filters, setFilter, activeFilterCount, getQueryParams, setPage } = usePolicyStore();
  const { toggleFilterDrawer } = useUIStore();

  const [exporting,         setExporting]         = useState('');
  const [bulkImportOpen,    setBulkImportOpen]    = useState(false);

  // Debounce search — only reset page when it actually changes
  const debouncedSearch = useDebounce(filters.search, 400);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading } = usePolicies();

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportApi[format](getQueryParams());
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting('');
    }
  };

  const filterCount = activeFilterCount();

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="input pl-9"
            placeholder="Search policyholder, serial, advisor..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Filter button with badge */}
          <button onClick={toggleFilterDrawer} className="btn-secondary relative">
            <span>⚡</span>
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-600 text-white
                text-xs rounded-full flex items-center justify-center font-medium">
                {filterCount}
              </span>
            )}
          </button>

          {/* Bulk import */}
          <button
            onClick={() => setBulkImportOpen(true)}
            className="btn-secondary"
            title="Import policies from Excel"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Export */}
          <div className="flex items-center gap-1">
            {['excel', 'csv', 'pdf'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={!!exporting}
                className="btn-secondary px-3 py-2 text-xs uppercase tracking-wide"
                title={`Export as ${fmt.toUpperCase()}`}
              >
                {exporting === fmt ? '⏳' : fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      <FilterChips />

      {/* Table */}
      <PolicyTable
        data={data?.data}
        pagination={data?.pagination}
        isLoading={isLoading}
      />

      {/* Modals */}
      <PolicyForm />
      <BulkImport open={bulkImportOpen} onClose={() => setBulkImportOpen(false)} />
      <FilterDrawer />
    </div>
  );
}
