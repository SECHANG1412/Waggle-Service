import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import OptionButton from './OptionButton';
import VoteInfo from './VoteInfo';
import { formatDateTime } from '../../../utils/date';

const TopicCard = ({ topic, onVote, onPinToggle }) => {
  const navigate = useNavigate();
  const formattedDate = useMemo(() => {
    return formatDateTime(topic.created_at, 'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [topic.created_at]);

  const commentCount = topic.comment_count ?? topic.comments_count ?? 0;
  const pinLabel = topic.is_pinned ? '북마크 해제' : '북마크';
  const detailPath = `/topic/${topic.topic_id}`;
  const visibleOptions = topic.vote_options.slice(0, 2);

  const isInteractiveElement = (target) =>
    Boolean(target.closest('a, button, input, select, textarea, [role="button"]'));

  const openDetail = () => {
    navigate(detailPath);
  };

  const onCardClick = (event) => {
    if (isInteractiveElement(event.target)) return;
    openDetail();
  };

  const onCardKeyDown = (event) => {
    if (isInteractiveElement(event.target)) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openDetail();
  };

  return (
    <article
      className="relative flex h-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 sm:p-3"
      role="link"
      tabIndex={0}
      aria-label={`${topic.title} 상세 보기`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {topic.is_pinned && (
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              Pinned
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {topic.category || '카테고리 없음'}
          </span>
          {topic.has_voted && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              투표 완료
            </span>
          )}
        </div>
        <button
          onClick={() => {
            onPinToggle(topic.topic_id, topic.is_pinned);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
          aria-label={pinLabel}
          title={pinLabel}
        >
          {topic.is_pinned ? <BsBookmarkFill className="h-4 w-4" /> : <BsBookmark className="h-4 w-4" />}
        </button>
      </div>

      <h3 className="mt-3 text-xl font-bold leading-tight tracking-normal text-slate-950">
        <Link
          to={detailPath}
          className="block truncate transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          aria-label={`${topic.title} 상세 보기`}
          title={topic.title}
        >
          {topic.title}
        </Link>
      </h3>

      {topic.author_name && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FaRegUserCircle className="h-6 w-6 shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500" aria-hidden="true" />
          <span className="truncate">{topic.author_name}</span>
        </div>
      )}

      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="space-y-2">
          {visibleOptions.map((opt, idx) => (
            <OptionButton key={idx} index={idx} option={opt} topic={topic} onVote={onVote} />
          ))}
        </div>
      </div>

      <VoteInfo createdAt={formattedDate} likeCount={topic.like_count} totalVote={topic.total_vote} commentCount={commentCount} />
    </article>
  );
};

export default TopicCard;
