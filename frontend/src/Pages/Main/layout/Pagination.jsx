import React, { useMemo } from "react";

const Pagination = ({ currentPage, total, perPage, onPageChange }) => {
  const totalPages = Math.ceil(total / perPage);
  const delta = 2;

  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    const range = [];

    range.push(1);
    if (left > 2) range.push('...');

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-6 flex justify-center gap-2 flex-wrap">
      {pages.map((page, index) =>
        page === '...' ? (
          <span key={index} className="px-3 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 border rounded-lg hover:bg-emerald-500 hover:text-white ${
              page === currentPage ? 'bg-emerald-500 text-white' : ''
            }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
};

export default Pagination;
