import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import ProgressBar from './ProgressBar';
import OptionButton from './OptionButton';
import VoteInfo from './VoteInfo';
import { formatDateTime } from '../../../utils/date';

const TopicCard = ({ topic, onVote, onPinToggle }) => {
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
  const pinLabel = topic.is_pinned ? '토픽 고정 해제' : '토픽 고정';

  return (
    <article className="relative flex flex-col h-full rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            {topic.is_pinned && (
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 bg-white">
                Pinned
              </span>
            )}
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800 bg-white">
              {topic.category || '기타'}
            </span>
            {topic.has_voted && (
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-50">
                투표 완료
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onPinToggle(topic.topic_id, topic.is_pinned);
              }}
              className="p-2 rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              aria-label={pinLabel}
              title={pinLabel}
            >
              {topic.is_pinned ? <BsBookmarkFill className="w-4 h-4" /> : <BsBookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight">
          <Link
            to={`/topic/${topic.topic_id}`}
            className="block line-clamp-2 text-slate-800 transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            aria-label={`${topic.title} 상세 보기`}
          >
            {topic.title}
          </Link>
        </h3>

        <div className="mt-3">
          <ProgressBar voteResults={topic.vote_results} totalVote={topic.total_vote} />
          <div className="space-y-2 mt-3">
            {topic.vote_options.map((opt, idx) => (
              <OptionButton key={idx} index={idx} option={opt} topic={topic} onVote={onVote} />
            ))}
          </div>
        </div>

        <VoteInfo createdAt={formattedDate} likeCount={topic.like_count} totalVote={topic.total_vote} commentCount={commentCount} />
        <Link
          to={`/topic/${topic.topic_id}`}
          className="mt-3 inline-flex w-fit text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          aria-label={`${topic.title} 상세 페이지로 이동`}
        >
          상세 보기
        </Link>
      </article>
  );
};

export default TopicCard;
