import React from 'react';
import { CATEGORIES } from '../../../constants/categories';

const Categories = ({ activeCategory, onClick }) => {
  return (
    <div className="flex overflow-x-auto scrollbar-hide max-w-full">
      <div className="flex items-center space-x-4 py-1 whitespace-nowrap">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category || (activeCategory === '' && category === '전체');
          return (
            <button
              key={category}
              onClick={() => onClick(category)}
              className={`relative px-1 pb-1 text-sm transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 ${
                isActive
                  ? 'text-slate-900 font-semibold after:absolute after:left-0 after:-bottom-[6px] after:h-[2px] after:w-full after:bg-blue-600'
                  : 'text-slate-700 font-medium hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
