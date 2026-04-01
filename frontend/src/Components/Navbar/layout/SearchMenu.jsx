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
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <BiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={onSearchInputChange}
        className="block w-full rounded-2xl bg-[#f5f6f8] py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-inner transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="검색어를 입력하세요"
      />
    </form>
  );
};

export default SearchMenu;
