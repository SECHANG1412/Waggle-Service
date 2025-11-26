import React from 'react';
import { CATEGORIES } from '../../../constants/categories';

const Categories = ({ activeCategory, onClick }) => {
  return (
    <div className="flex overflow-x-auto scrollbar-hide max-w-full">
      <div className="flex space-x-2 py-1 whitespace-nowrap">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category || (activeCategory === '' && category === '전체');
          return (
            <button
              key={category}
              onClick={() => onClick(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
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
