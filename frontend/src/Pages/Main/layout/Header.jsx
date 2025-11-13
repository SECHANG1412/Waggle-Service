import React from 'react';

const Header = ({ title, total, sort, onSortChange }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
      <h2 className="text-2xl font-bold text-emerald-800">
        {title}
        <span className="ml-2 text-base font-medium text-gray-600">({total})</span>
      </h2>
      <select className="px-4 py-2 border rounded-lg" value={sort} onChange={onSortChange}>
        <option value="created_at">최신순</option>
        <option value="like_count">인기순</option>
        <option value="vote_count">조회순</option>
      </select>
    </div>
  );
};

export default Header;
