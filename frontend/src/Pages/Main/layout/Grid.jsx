import React from 'react';
import { Link } from 'react-router-dom';
import TopicCard from '../TopicCard';

const TopicSkeletonCard = () => (
  <div className="h-full min-h-[240px] rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="h-5 w-3/5 animate-pulse rounded bg-slate-200" />
    </div>
    <div className="mt-3 h-2 w-full animate-pulse rounded bg-slate-200" />
    <div className="mt-3 space-y-2">
      <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
      <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
);

const LoadingGrid = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <TopicSkeletonCard key={index} />
    ))}
  </div>
);

const EmptyState = ({ isAuthenticated }) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <p className="text-lg font-semibold text-slate-800">조건에 맞는 토픽이 없습니다.</p>
    <p className="mt-2 text-sm text-slate-500">
      검색어 또는 카테고리 조건을 바꿔보거나 새로운 토픽을 만들어 보세요.
    </p>
    {isAuthenticated ? (
      <Link
        to="/create-topic"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        새 토픽 만들기
      </Link>
    ) : (
      <p className="mt-5 text-sm text-slate-500">로그인하면 새 토픽을 만들 수 있습니다.</p>
    )}
  </div>
);

const Grid = ({ topics, loading, onVote, onPinToggle, isAuthenticated }) => {
  if (loading) {
    return <LoadingGrid />;
  }

  if (topics.length === 0) {
    return <EmptyState isAuthenticated={isAuthenticated} />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {topics.map((topic) => (
        <TopicCard
          topic={topic}
          onVote={onVote}
          onPinToggle={onPinToggle}
          isAuthenticated={isAuthenticated}
          key={topic.topic_id}
        />
      ))}
    </div>
  );
};

export default Grid;
