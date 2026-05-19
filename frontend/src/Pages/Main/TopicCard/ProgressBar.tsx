import { voteColors } from '../../../constants/voteColors';

type VoteColorKey = keyof typeof voteColors;

type ProgressBarProps = {
  voteResults: number[];
  totalVote: number;
};

const ProgressBar = ({ voteResults, totalVote }: ProgressBarProps) => {
  const optionCount = voteResults.length;
  let accumulated = 0;

  return (
    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      {voteResults.map((count, idx) => {
        const width = totalVote > 0 ? (count / totalVote) * 100 : 0;
        const left = accumulated;
        accumulated += width;

        return (
          <div
            key={idx}
            className="absolute h-full"
            style={{
              width: `${width}%`,
              left: `${left}%`,
              backgroundColor: voteColors[optionCount as VoteColorKey]?.[idx] || '#64748b',
            }}
          />
        );
      })}
    </div>
  );
};

export default ProgressBar;
