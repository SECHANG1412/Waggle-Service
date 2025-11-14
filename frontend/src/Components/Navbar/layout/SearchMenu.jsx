import React from 'react';
import { BiSearch } from 'react-icons/bi';
import SharedNavLinks from '../shared/SharedNavLinks';

const SearchMenu = ({ search, onSearchInputChange }) => {
  return (
    <div className="hidden xl:flex items-center ml-8 flex-1">
      <form className="relative flex-1 max-w-6xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={onSearchInputChange}
          className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-emerald-100 text-emerald-900 placeholder-emerald-500 hover:bg-white hover:text-emerald-900 hover:placeholder-emerald-400 sm:text-sm transition-all duration-500"
          placeholder="토픽 검색하기..."
        />
      </form>
      <div className="flex items-center ml-8 space-x-8">
        <SharedNavLinks linkClassName="flex flex-col items-center text-white hover:text-gray-200 transition-all duration-500" />
      </div>
    </div>
  );
};

export default SearchMenu;
