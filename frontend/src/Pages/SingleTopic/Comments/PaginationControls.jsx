import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-h-11 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-300"
      >
        이전
      </button>
      <span className="flex min-h-11 min-w-16 items-center justify-center px-3 py-2 text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-h-11 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-300"
      >
        다음
      </button>
    </div>
  );
};

export default PaginationControls;
