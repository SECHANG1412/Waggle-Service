import { useMemo } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import OptionButton from './OptionButton';
import VoteInfo from './VoteInfo';
import { formatDateTime, parseApiDate } from '../../../utils/date';
import type { MainPinToggleHandler, MainTopic, MainVoteHandler } from '..';

type TopicCardProps = {
  topic: MainTopic;
  onVote: MainVoteHandler;
  onPinToggle: MainPinToggleHandler;
  isAuthLoading: boolean;
};

type DeadlineStatus = {
  label: string;
  className: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const getDeadlineStatus = (expiresAt: string | null, isClosed: boolean): DeadlineStatus => {
  const deadline = parseApiDate(expiresAt);

  if (!deadline || Number.isNaN(deadline.getTime())) {
    return {
      label: '마감 시간 없음',
      className: 'border-slate-200 bg-slate-50 text-slate-600',
    };
  }

  const now = new Date();

  if (isClosed || deadline.getTime() <= now.getTime()) {
    return {
      label: '마감됨',
      className: 'border-slate-200 bg-white/70 text-slate-600',
    };
  }

  if (getLocalDateKey(deadline) === getLocalDateKey(now)) {
    return {
      label: '오늘 마감',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  const daysLeft = Math.max(1, Math.ceil((getLocalDayStart(deadline) - getLocalDayStart(now)) / DAY_MS));

  return {
    label: daysLeft === 1 ? '1일 남음' : `${daysLeft}일 남음`,
    className: daysLeft === 1
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-slate-200 bg-slate-50 text-slate-700',
  };
};

const TopicCard = ({ topic, onVote, onPinToggle, isAuthLoading }: TopicCardProps) => {
  const navigate = useNavigate();
  const isClosed = topic.is_closed;
  const formattedDate = useMemo(() => {
    return formatDateTime(topic.created_at, 'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [topic.created_at]);
  const deadlineStatus = useMemo(() => getDeadlineStatus(topic.expires_at, isClosed), [topic.expires_at, isClosed]);

  const commentCount = topic.comment_count ?? 0;
  const pinLabel = topic.is_pinned ? '북마크 해제' : '북마크';
  const detailPath = `/topic/${topic.topic_id}`;
  const visibleOptions = topic.vote_options.slice(0, 2);

  const isInteractiveElement = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest('a, button, input, select, textarea, [role="button"]'));

  const openDetail = () => {
    navigate(detailPath);
  };

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveElement(event.target)) return;
    openDetail();
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isInteractiveElement(event.target)) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openDetail();
  };

  return (
    <article
      className={`relative flex h-full cursor-pointer flex-col rounded-xl border p-2.5 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 sm:p-3 ${
        isClosed
          ? 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-200'
          : 'border-slate-200 bg-white/95 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md'
      }`}
      role="link"
      tabIndex={0}
      aria-label={`${topic.title} 상세 보기`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
            {topic.category || '카테고리 없음'}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${deadlineStatus.className}`}>
            {deadlineStatus.label}
          </span>
        </div>
        <button
          disabled={isAuthLoading}
          onClick={() => {
            onPinToggle(topic.topic_id, topic.is_pinned);
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-60 ${
            topic.is_pinned
              ? 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
              : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
          }`}
          aria-label={pinLabel}
          title={pinLabel}
        >
          {topic.is_pinned ? <BsBookmarkFill className="h-4 w-4" /> : <BsBookmark className="h-4 w-4" />}
        </button>
      </div>

      <h3 className="mt-2.5 text-lg font-bold leading-tight tracking-normal text-slate-950 sm:text-xl">
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
        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <FaRegUserCircle className="h-5 w-5 shrink-0 rounded-full bg-slate-100 p-1 text-slate-500" aria-hidden="true" />
          <span className="truncate">{topic.author_name}</span>
        </div>
      )}
      <div className="mt-2.5 border-t border-slate-200 pt-2.5">
        <div className="space-y-1.5">
          {visibleOptions.map((opt, idx) => (
            <OptionButton
              key={idx}
              index={idx}
              option={opt}
              topic={topic}
              onVote={onVote}
              isAuthLoading={isAuthLoading}
            />
          ))}
        </div>
      </div>

      <VoteInfo createdAt={formattedDate} likeCount={topic.like_count} totalVote={topic.total_vote} commentCount={commentCount} />
    </article>
  );
};

export default TopicCard;
