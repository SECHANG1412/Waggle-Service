import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const VoteButtons = ({ voteOptions, voteResults, totalVotes, hasVoted, useVoteIndex, onVote, colors }) => {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      {voteOptions.map((option, idx) => {
        const selected = useVoteIndex === idx;
        const baseColor = colors?.[idx] || '#64748b';
        const voteCount = voteResults[idx] ?? 0;
        const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        const softBg = idx === 0 ? '#f0fdf4' : '#fff1f2';

        return (
          <article
            key={`${option}-${idx}`}
            className="rounded-xl border border-l-4 bg-white p-3 transition sm:p-4"
            style={{
              backgroundColor: hasVoted ? '#ffffff' : softBg,
              borderColor: hasVoted ? '#e2e8f0' : `${baseColor}55`,
              borderLeftColor: baseColor,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-bold sm:text-base" style={{ color: baseColor }}>
                    {option}
                  </h3>
                  {hasVoted && selected && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: `${baseColor}18`, color: baseColor }}
                    >
                      <FaCheckCircle className="h-3 w-3" />
                      내 선택
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold leading-none sm:text-3xl" style={{ color: baseColor }}>
                    {percent}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500 sm:text-sm">{voteCount}표</span>
                </div>
              </div>

              {!hasVoted && (
                <button
                  onClick={() => onVote(idx)}
                  className="min-h-10 shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 sm:text-sm"
                  style={{ backgroundColor: baseColor }}
                >
                  투표하기
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default VoteButtons;
