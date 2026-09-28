import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPageList(page, pageCount) {
  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
}

export default function Pagination({ page, pageCount, onPageChange, totalItems, pageSize }) {
  if (pageCount <= 1) return null;

  const pages = buildPageList(page, pageCount);
  const rangeStart = totalItems ? (page - 1) * pageSize + 1 : null;
  const rangeEnd = totalItems ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-1 pt-4 sm:flex-row">
      {totalItems != null && (
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{rangeStart}</span>–
          <span className="font-medium text-gray-700">{rangeEnd}</span> of{' '}
          <span className="font-medium text-gray-700">{totalItems}</span>
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-sm text-gray-400">&hellip;</span>}
              <button
                onClick={() => onPageChange(p)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors duration-150 ${
                  p === page ? 'bg-sky-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
