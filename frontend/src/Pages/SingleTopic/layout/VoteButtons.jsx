import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const VoteButtons = ({ voteOptions, voteResults, totalVotes, hasVoted, useVoteIndex, onVote, colors }) => {
  return (
    <div className="my-6 space-y-3">
      {voteOptions.map((option, idx) => {
        const selected = useVoteIndex === idx;
        const bgColor = hasVoted ? (selected ? colors[idx] : '#E5E7EB') : 'white';
        const borderColor = hasVoted ? 'transparent' : colors[idx];
        const textColor = selected ? 'text-white' : 'text-gray-700';
        const percent = totalVotes > 0 ? Math.round((voteResults[idx] / totalVotes) * 100) : 0;

        return (
          <button
            key={idx}
            onClick={() => onVote(idx)}
            disabled={hasVoted}
            className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-4 text-left text-base font-semibold transition-all duration-200 sm:px-6 ${
              hasVoted ? (selected ? 'text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed') : ''
            }`}
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
          >
            <span className="min-w-0 flex-1 break-words leading-snug">{option}</span>

            {hasVoted && (
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <span className={textColor}>{voteResults[idx]}</span>
                <span className={textColor}>{percent}%</span>
                {selected && <FaCheckCircle className="w-5 h-5" />}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default VoteButtons;
