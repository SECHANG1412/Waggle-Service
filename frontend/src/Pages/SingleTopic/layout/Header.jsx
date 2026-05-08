import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/date';

const Header = ({ title, authorName, category, createdAt, liked, likes, onLikeClick, actions }) => {
  const formattedDate = formatDateTime(createdAt, 'ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const metaItems = [authorName, category, formattedDate].filter(Boolean);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{title}</h1>
        {metaItems.length > 0 && (
          <p className="mt-2 break-words text-sm font-medium text-slate-500">
            {metaItems.join(' · ')}
          </p>
        )}
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        {actions}
        <button
          onClick={onLikeClick}
          className="flex min-h-11 items-center space-x-2 rounded-xl border border-gray-200 px-3 py-2 text-lg font-semibold transition-all hover:border-blue-400"
        >
          <FaHeart className={`w-6 h-6 ${liked ? 'text-rose-500' : 'text-gray-300'}`} />
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
