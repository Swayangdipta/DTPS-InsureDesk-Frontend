export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const getPages = () => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) {
      if (range[0] > 2) range.unshift('...');
      range.unshift(1);
    }
    if (range[range.length - 1] < pages) {
      if (range[range.length - 1] < pages - 1) range.push('...');
      range.push(pages);
    }
    return range;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3
      px-4 py-3 border-t border-gray-200 dark:border-gray-700">

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing{' '}
        <span className="font-medium text-gray-700 dark:text-gray-200">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total}</span>
        {' '}policies
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-2.5 py-1.5 text-xs rounded-lg border
            border-gray-300 dark:border-gray-700
            text-gray-600 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-800
            disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ‹ Prev
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-gray-400 dark:text-gray-500 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-xs rounded-lg border transition
                ${p === page
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-2.5 py-1.5 text-xs rounded-lg border
            border-gray-300 dark:border-gray-700
            text-gray-600 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-800
            disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
