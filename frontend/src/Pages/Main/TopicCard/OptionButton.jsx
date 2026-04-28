import React from 'react';
import { voteColors } from '../../../constants/voteColors';

const OptionButton = ({ option, index, topic, onVote }) => {
  const optionCount = topic.vote_options.length;
  const isSelected = topic.has_voted && topic.user_vote_index === index;
  const baseColor = voteColors[optionCount][index];

  const styles = {
    backgroundColor: topic.has_voted ? (isSelected ? baseColor : '#f8fafc') : '#ffffff',
    color: topic.has_voted ? (isSelected ? '#ffffff' : '#1f2937') : baseColor,
    border: topic.has_voted ? (isSelected ? `1px solid ${baseColor}` : '1px solid #e5e7eb') : `1px solid ${baseColor}`,
  };

  return (
    <button
      disabled={topic.has_voted}
      onClick={(event) => {
        event.stopPropagation();
        if (!topic.has_voted) onVote(topic.topic_id, index);
      }}
      style={styles}
      className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-transparent hover:bg-opacity-90 hover:shadow-md hover:ring-2 hover:ring-blue-100 disabled:cursor-not-allowed"
    >
      <span className="min-w-0 flex-1 break-words leading-snug">{option}</span>
      <span className="shrink-0 rounded-full border border-white/60 bg-white/80 px-2 py-0.5 text-xs text-gray-700">
        {topic.vote_results[index]}표
      </span>
    </button>
  );
};

export default OptionButton;
