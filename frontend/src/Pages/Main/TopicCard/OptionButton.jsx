import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { voteColors } from '../../../constants/voteColors';

const OptionButton = ({ option, index, topic, onVote }) => {
  const optionCount = topic.vote_options.length;
  const isSelected = topic.has_voted && topic.user_vote_index === index;
  const baseColor = voteColors[optionCount]?.[index] || voteColors[2][index] || '#64748b';
  const voteCount = topic.vote_results[index] ?? 0;
  const percent = topic.total_vote > 0 ? Math.round((voteCount / topic.total_vote) * 100) : 0;
  const inactiveBg = index === 0 ? '#f0fdf4' : '#fff1f2';

  const styles = {
    backgroundColor: topic.has_voted && isSelected ? baseColor : inactiveBg,
    borderColor: topic.has_voted && isSelected ? baseColor : `${baseColor}33`,
    borderLeftColor: baseColor,
  };

  return (
    <button
      disabled={topic.has_voted}
      onClick={(event) => {
        event.stopPropagation();
        if (!topic.has_voted) onVote(topic.topic_id, index);
      }}
      style={styles}
      className="group flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-l-4 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed"
    >
      <span
        className="min-w-0 flex-1 break-words text-lg font-bold leading-snug"
        style={{ color: topic.has_voted && isSelected ? '#ffffff' : baseColor }}
      >
        {option}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className={`text-right ${topic.has_voted && isSelected ? 'text-white' : 'text-slate-500'}`}>
          <span
            className="block text-lg font-bold leading-tight"
            style={{ color: topic.has_voted && isSelected ? '#ffffff' : baseColor }}
          >
            {percent}%
          </span>
          <span className="block text-sm font-medium leading-tight">{voteCount}표</span>
        </span>
        <FiChevronRight
          className={`h-5 w-5 transition group-hover:translate-x-0.5 ${
            topic.has_voted && isSelected ? 'text-white' : 'text-slate-500'
          }`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default OptionButton;
