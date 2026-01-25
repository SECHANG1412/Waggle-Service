import React from 'react';
import { FaHeart, FaCommentDots } from 'react-icons/fa';

const VoteInfo = ({ createdAt, likeCount, totalVote, commentCount }) => {
  return (
    <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
      <span className="whitespace-nowrap">{createdAt}</span>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <FaHeart className="text-rose-400" />
          {likeCount}
        </span>
        <span className="flex items-center gap-1">
          <FaCommentDots className="text-blue-400" />
          {commentCount}
        </span>
        <span className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 font-semibold">
          총 {totalVote}표
        </span>
      </div>
    </div>
  );
};

export default VoteInfo;
