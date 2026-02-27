import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="mt-6 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded bg-gray-100 px-4 py-2 text-sm disabled:bg-gray-100/50"
      >
        Previous
      </button>
      <span className="px-3 py-2 text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded bg-gray-100 px-4 py-2 text-sm disabled:bg-gray-100/50"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
