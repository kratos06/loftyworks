import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 50,
  onPageSizeChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center py-3 px-5 bg-white border border-[var(--solid-black-ebecf1)] rounded-b-md">
      <div className="flex items-center gap-2 px-3 py-2 border border-[var(--solid-black-e1e2e6)] rounded-md bg-white">
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[30px] h-[30px] px-2 py-1 text-sm rounded-md transition-colors ${
                page === currentPage
                  ? "font-bold text-[var(--solid-sales-theme-5d51e2)] bg-white"
                  : "font-normal text-[var(--solid-black-515666)] bg-white hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="min-w-[30px] h-[30px] px-2 py-1 text-sm text-[var(--solid-black-515666)] text-center">
                ...
              </span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="min-w-[30px] h-[30px] px-2 py-1 text-sm text-[var(--solid-black-515666)] bg-white hover:bg-gray-50 rounded-md"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--solid-black-ebecf1)]" />

        {/* Page controls */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="w-10 h-6 px-2 text-sm text-center border border-[var(--solid-black-c6c8d1)] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--solid-sales-theme-5d51e2)]"
            min={1}
            max={totalPages}
          />

          {onPageSizeChange && (
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="w-15 h-6 px-2 pr-6 text-sm border border-[var(--solid-black-c6c8d1)] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--solid-sales-theme-5d51e2)] appearance-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 13 12" fill="none">
                  <path
                    d="M6.5003 9.25492L1.35905 4.14367C1.2892 4.07341 1.25 3.97836 1.25 3.87929C1.25 3.78022 1.2892 3.68518 1.35905 3.61492C1.39391 3.57977 1.43538 3.55187 1.48108 3.53283C1.52678 3.5138 1.57579 3.50399 1.6253 3.50399C1.6748 3.50399 1.72382 3.5138 1.76951 3.53283C1.81521 3.55187 1.85669 3.57977 1.89155 3.61492L6.5003 8.19742L11.109 3.61117C11.1439 3.57602 11.1854 3.54812 11.2311 3.52908C11.2768 3.51005 11.3258 3.50024 11.3753 3.50024C11.4248 3.50024 11.4738 3.51005 11.5195 3.52908C11.5652 3.54812 11.6067 3.57602 11.6415 3.61117C11.7114 3.68143 11.7506 3.77647 11.7506 3.87554C11.7506 3.97461 11.7114 4.06966 11.6415 4.13992L6.5003 9.25492Z"
                    fill="var(--solid-black-c6c8d1)"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
