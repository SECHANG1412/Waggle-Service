import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-100 text-sm disabled:bg-gray-100/50"
      >
        이전
      </button>
      <span className="px-3 py-1 text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-100 text-sm disabled:bg-gray-100/50"
      >
        다음
      </button>
    </div>
  );
};

export default PaginationControls;
