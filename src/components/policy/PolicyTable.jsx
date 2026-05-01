import { useNavigate }    from 'react-router-dom';
import { SkeletonTable }  from '@/components/common/Skeleton';
import Pagination         from '@/components/common/Pagination';
import ConfirmDialog      from '@/components/common/ConfirmDialog';
import { PaymentBadge, BondBadge, CategoryBadge } from '@/components/common/Badge';
import { useDeletePolicy, useToggleBookmark }      from '@/hooks/usePolicies';
import useUIStore         from '@/store/uiStore';
import usePolicyStore     from '@/store/policyStore';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { getRowClass }    from '@/utils/rowColor';

const COLUMNS = [
  { key: 'serialNumber',      label: 'SL No',          sortable: false },
  { key: 'policyHolderName',  label: 'Policyholder',   sortable: true  },
  { key: 'category',          label: 'Category',       sortable: false },
  { key: 'company',           label: 'Company',        sortable: false },
  { key: 'premiumWithoutGST', label: 'Premium (ex-GST)', sortable: true },
  { key: 'premiumWithGST',    label: 'Premium (GST)',  sortable: true  },
  { key: 'paidDate',          label: 'Paid Date',      sortable: true  },
  { key: 'paymentStatus',     label: 'Payment',        sortable: false },
  { key: 'bondStatus',        label: 'Bond',           sortable: false },
  { key: 'nextRenewalDate',   label: 'Renewal',        sortable: true  },
  { key: 'actions',           label: '',               sortable: false },
];

export default function PolicyTable({ data, pagination, isLoading }) {
  const navigate  = useNavigate();
  const { setPage, sort, setSort } = usePolicyStore();
  const { openPolicyModal, openDeleteDialog, deleteDialog, closeDeleteDialog } = useUIStore();

  const deleteMutation   = useDeletePolicy();
  const bookmarkMutation = useToggleBookmark();

  const handleSort = (key) => {
    if (!key) return;
    setSort(sort === key ? `-${key}` : key);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteDialog.id);
    closeDeleteDialog();
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    const active = sort === col.key || sort === `-${col.key}`;
    const desc   = sort === `-${col.key}`;
    return (
      <span className={`ml-1 text-xs ${active ? 'text-brand-500' : 'text-gray-300'}`}>
        {active ? (desc ? '▼' : '▲') : '↕'}
      </span>
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold
                    text-gray-600 dark:text-gray-400 whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 select-none' : ''}
                  `}
                >
                  {col.label}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <SkeletonTable rows={10} cols={COLUMNS.length} />
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length}
                  className="px-4 py-16 text-center text-gray-400 text-sm">
                  No policies found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              data?.map((policy) => (
                <tr
                  key={policy._id}
                  className={`${getRowClass(policy.rowColor)} cursor-pointer`}
                  onClick={() => navigate(`/policies/${policy._id}`)}
                >
                  {/* SL No */}
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {policy.serialNumber || '—'}
                  </td>

                  {/* Policyholder */}
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap max-w-[180px] truncate">
                    <div className="flex items-center gap-1.5">
                      {policy.isBookmarked && <span className="text-yellow-500 text-xs">★</span>}
                      {policy.policyHolderName}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {policy.category
                      ? <CategoryBadge name={policy.category.name} colorCode={policy.category.colorCode} />
                      : '—'}
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {policy.company?.name || '—'}
                  </td>

                  {/* Premium WITHOUT GST — primary business amount */}
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {formatCurrency(policy.premiumWithoutGST)}
                  </td>

                  {/* Premium WITH GST */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {formatCurrency(policy.premiumWithGST)}
                  </td>

                  {/* Paid Date */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(policy.paidDate)}
                  </td>

                  {/* Payment Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentBadge status={policy.paymentStatus} />
                  </td>

                  {/* Bond Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <BondBadge status={policy.bondStatus} />
                  </td>

                  {/* Renewal */}
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(policy.nextRenewalDate)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => bookmarkMutation.mutate(policy._id)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Toggle bookmark"
                      >
                        <span className={policy.isBookmarked ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                      </button>
                      <button
                        onClick={() => openPolicyModal(policy)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-brand-600"
                        title="Edit"
                      >✎</button>
                      <button
                        onClick={() => openDeleteDialog(policy._id, policy.policyHolderName)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-red-600"
                        title="Delete"
                      >🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        message={`Delete policy for "${deleteDialog.name}"? This cannot be undone.`}
      />
    </div>
  );
}
