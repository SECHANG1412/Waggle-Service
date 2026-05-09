import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const VoteButtons = ({ voteOptions, voteResults, totalVotes, hasVoted, useVoteIndex, onVote, colors }) => {
  return (
    <div className="space-y-4">
      {voteOptions.map((option, idx) => {
        const selected = useVoteIndex === idx;
        const baseColor = colors?.[idx] || '#64748b';
        const voteCount = voteResults[idx] ?? 0;
        const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        const isPositiveTone = idx === 0;
        const softBg = isPositiveTone ? '#f0fdf4' : '#fff1f2';
        const textColor = hasVoted && selected ? '#ffffff' : baseColor;

        return (
          <article
            key={`${option}-${idx}`}
            className="rounded-xl border p-4 transition sm:p-5"
            style={{
              backgroundColor: hasVoted && selected ? baseColor : softBg,
              borderColor: hasVoted && selected ? baseColor : `${baseColor}66`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold" style={{ color: textColor }}>
                  {option}
                </h3>
                <p className="mt-2 text-4xl font-extrabold leading-none sm:text-5xl" style={{ color: textColor }}>
                  {percent}%
                </p>
                <p className={`mt-2 text-sm font-bold ${hasVoted && selected ? 'text-white' : 'text-slate-600'}`}>
                  {voteCount}표
                </p>
              </div>
              {hasVoted && selected && <FaCheckCircle className="mt-1 h-5 w-5 shrink-0 text-white" />}
            </div>
            <button
              onClick={() => onVote(idx)}
              disabled={hasVoted}
              className={`mt-4 min-h-11 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed sm:text-base ${
                hasVoted ? 'opacity-70' : 'hover:brightness-95'
              }`}
              style={{ backgroundColor: baseColor }}
            >
              {hasVoted ? (selected ? '선택한 항목' : '투표 완료') : `${option}에 투표하기`}
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default VoteButtons;
