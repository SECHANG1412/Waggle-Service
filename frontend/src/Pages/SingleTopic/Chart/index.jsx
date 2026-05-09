import React, { useCallback, useEffect, useState } from 'react';
import { useVote } from '../../../hooks/useVote';
import ChartHeader from './ChartHeader';
import ChartCanvas from './ChartCanvas';
import ChartLegend from './ChartLegend';
import { voteColors } from '../../../constants/voteColors';
import TimeFrameButtons from './TimeFrameButtons';

const timeFrames = ['1H', '6H', '1D', '1W', 'ALL'];

const Chart = ({ topicId, voteOptions }) => {
  const { getTopicVotes } = useVote();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1D');
  const [loading, setLoading] = useState(false);
  const [voteData, setVoteData] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const colors = voteColors[voteOptions.length] || [];
  const chartMetric = 'percent';

  const fetchTopicVotes = useCallback(
    async (frame) => {
      if (!topicId) return;
      setLoading(true);

      try {
        const nextVoteData = await getTopicVotes(topicId, frame);
        setVoteData(nextVoteData || []);
      } finally {
        setHasLoaded(true);
        setLoading(false);
      }
    },
    [topicId, getTopicVotes]
  );

  useEffect(() => {
    fetchTopicVotes('1D');
  }, [fetchTopicVotes]);

  const onTimeFrameChange = (frame) => {
    if (frame !== selectedTimeFrame) {
      setSelectedTimeFrame(frame);
      fetchTopicVotes(frame);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <ChartHeader />
      <ChartLegend options={voteOptions} colors={colors} />
      <div className="mt-4 overflow-hidden rounded-md">
        {loading ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 sm:h-[300px]">
            투표 트렌드를 불러오는 중입니다.
          </div>
        ) : voteData.length === 0 && hasLoaded ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 sm:h-[300px]">
            표시할 투표 트렌드가 아직 없습니다.
          </div>
        ) : (
          <div className="h-[220px] w-full sm:h-[300px]">
            <ChartCanvas
              data={voteData}
              metric={chartMetric}
              options={voteOptions}
              colors={colors}
              timeFrame={selectedTimeFrame}
            />
          </div>
        )}
      </div>
      <TimeFrameButtons
        selected={selectedTimeFrame}
        onChange={onTimeFrameChange}
        loading={loading}
        options={timeFrames}
      />
    </section>
  );
};

export default Chart;
