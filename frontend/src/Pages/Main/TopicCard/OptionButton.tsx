import { FiCheck } from 'react-icons/fi';
import { voteColors } from '../../../constants/voteColors';
import type { MainTopic, MainVoteHandler } from '..';

type VoteColorKey = keyof typeof voteColors;

type OptionButtonProps = {
  option: string;
  index: number;
  topic: MainTopic;
  onVote: MainVoteHandler;
  isAuthLoading: boolean;
};

const OptionButton = ({ option, index, topic, onVote, isAuthLoading }: OptionButtonProps) => {
  const optionCount = topic.vote_options.length;
  const isClosed = topic.is_closed;
  const isSelected = topic.has_voted && topic.user_vote_index === index;
  const baseColor = voteColors[optionCount as VoteColorKey]?.[index] || voteColors[2][index] || '#64748b';
  const displayColor = isClosed ? '#64748b' : baseColor;
  const voteCount = topic.vote_results[index] ?? 0;
  const percent = topic.total_vote > 0 ? Math.round((voteCount / topic.total_vote) * 100) : 0;

  const styles = {
    backgroundColor: isClosed ? '#f8fafc' : '#ffffff',
    borderColor: isClosed ? '#e2e8f0' : isSelected ? baseColor : `${baseColor}33`,
    borderLeftColor: displayColor,
  };

  return (
    <button
      disabled={topic.has_voted || topic.is_closed || isAuthLoading}
      onClick={(event) => {
        event.stopPropagation();
        if (!topic.has_voted && !topic.is_closed && !isAuthLoading) onVote(topic.topic_id, index);
      }}
      style={styles}
      className="group relative flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-l-4 px-3 py-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <span
        className="absolute inset-y-0 left-0 rounded-l-md transition-[width] duration-300"
        style={{
          width: `${percent}%`,
          backgroundColor: displayColor,
          opacity: isClosed ? 0.1 : isSelected ? 0.18 : 0.12,
        }}
        aria-hidden="true"
      />
      <span
        className="relative z-10 min-w-0 flex-1 break-words text-sm font-bold leading-snug"
        style={{ color: displayColor }}
      >
        {option}
      </span>
      {isSelected && (
        <span
          className="absolute -right-1.5 -top-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full"
          style={{ backgroundColor: baseColor }}
        >
          <FiCheck className="h-3 w-3 text-white" aria-hidden="true" />
        </span>
      )}
      <span className="relative z-10 shrink-0 text-right">
        <span className="text-right text-slate-500">
          <span
            className="block text-sm font-bold leading-tight"
            style={{ color: displayColor }}
          >
            {percent}%
          </span>
          <span className="block text-xs font-medium leading-tight">{voteCount}표</span>
        </span>
      </span>
    </button>
  );
};

export default OptionButton;
