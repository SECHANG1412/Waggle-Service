import React from 'react';
import { FaHeart, FaCommentDots } from 'react-icons/fa';

const VoteInfo = ({ createdAt, likeCount, totalVote, commentCount }) => {
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
      <span className="whitespace-nowrap">{createdAt}</span>
      <div className="flex shrink-0 items-center gap-4">
        <span className="flex items-center gap-1.5">
          <FaHeart className="text-rose-400" />
          {likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <FaCommentDots className="text-blue-400" />
          {commentCount}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
          총 {totalVote}표
        </span>
      </div>
    </div>
  );
};

export default VoteInfo;
