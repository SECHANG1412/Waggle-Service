import React from 'react';
import { BiSearch } from 'react-icons/bi';

const SearchMenu = ({ searchValue, onSearchInputChange, onSearchSubmit }) => {
  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        onSearchSubmit?.();
      }}
    >
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <BiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={onSearchInputChange}
        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
        placeholder="검색"
      />
    </form>
  );
};

export default SearchMenu;
