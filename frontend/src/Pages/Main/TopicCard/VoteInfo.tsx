import { FaHeart, FaCommentDots } from 'react-icons/fa';

type VoteInfoProps = {
  deadlineLabel: string;
  deadlineDetail: string;
  deadlineClassName: string;
  likeCount: number;
  totalVote: number;
  commentCount: number;
};

const VoteInfo = ({
  deadlineLabel,
  deadlineDetail,
  deadlineClassName,
  likeCount,
  totalVote,
  commentCount,
}: VoteInfoProps) => {
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${deadlineClassName}`}>
          {deadlineLabel}
        </span>
        <span className="min-w-0 truncate font-medium text-slate-500">{deadlineDetail}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="flex items-center gap-1">
          <FaHeart className="text-rose-400" />
          {likeCount}
        </span>
        <span className="flex items-center gap-1">
          <FaCommentDots className="text-blue-400" />
          {commentCount}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          총 {totalVote}표
        </span>
      </div>
    </div>
  );
};

export default VoteInfo;
