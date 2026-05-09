import React from 'react';
import { FaHeart, FaRegCalendarAlt, FaRegCommentDots, FaRegUser } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/date';

const Header = ({
  title,
  description,
  category,
  authorName,
  createdAt,
  commentCount,
  liked,
  likes,
  onLikeClick,
  actions,
}) => {
  const formattedDate = formatDateTime(createdAt, 'ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 sm:px-2.5 sm:py-1 sm:text-sm">
            {category || '카테고리 없음'}
          </span>
          <h1 className="mt-3 break-words text-2xl font-bold leading-tight tracking-normal text-slate-950 sm:mt-4 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 break-words text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-lg">
              {description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          <button
            onClick={onLikeClick}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
            aria-label="좋아요"
          >
            <FaHeart className={`h-4 w-4 ${liked ? 'text-rose-500' : 'text-slate-300'}`} />
            <span>{likes}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500 sm:mt-5 sm:gap-x-4 sm:text-sm">
        {authorName && (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-700 sm:h-8 sm:w-8 sm:text-sm">
              {authorName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-slate-700">{authorName}</span>
          </span>
        )}
        {!authorName && (
          <span className="inline-flex items-center gap-1.5">
            <FaRegUser className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>작성자</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <FaRegCalendarAlt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{formattedDate}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FaRegCommentDots className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{commentCount}</span>
        </span>
      </div>
    </section>
  );
};

export default Header;
