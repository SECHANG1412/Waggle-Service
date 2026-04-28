import React, { useCallback, useEffect, useState } from 'react';
import { useVote } from '../../../hooks/useVote';
import ChartHeader from './ChartHeader';
import ChartCanvas from './ChartCanvas';
import { voteColors } from '../../../constants/voteColors';
import TimeFrameButtons from './TimeFrameButtons';

const timeFrames = ['1H', '6H', '1D', '1W', '1M', 'ALL'];

const Chart = ({ topicId, voteOptions }) => {
  const { getTopicVotes } = useVote();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1D');
  const [chartMetric, setChartMetric] = useState('count');
  const [loading, SetLoading] = useState(false);
  const [voteData, setVoteData] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchTopicVotes = useCallback(
    async (frame) => {
      if (!topicId) return;
      SetLoading(true);

      try {
        const tmpVoteData = await getTopicVotes(topicId, frame);
        setVoteData(tmpVoteData || []);
      } finally {
        setHasLoaded(true);
        SetLoading(false);
      }
    },
    [topicId, getTopicVotes]
  );

  useEffect(() => {
    fetchTopicVotes('1D');
  }, [fetchTopicVotes]);

  const onTimeFrameChage = (frame) => {
    if (frame !== selectedTimeFrame) {
      setSelectedTimeFrame(frame);
      fetchTopicVotes(frame);
    }
  };

  return (
    <div className="relative mb-6 rounded-lg bg-gray-100 p-3 shadow-inner sm:p-5">
      <ChartHeader chartMetric={chartMetric} setChartMetric={setChartMetric} loading={loading} />
      <div className="overflow-hidden rounded-md">
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-slate-500">
            차트 데이터를 불러오는 중입니다.
          </div>
        ) : voteData.length === 0 && hasLoaded ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-slate-500">
            표시할 투표 데이터가 없습니다.
          </div>
        ) : (
          <div className="w-full">
            <ChartCanvas
              data={voteData}
              metric={chartMetric}
              options={voteOptions}
              colors={voteColors[voteOptions.length]}
              timeFrame={selectedTimeFrame}
            />
          </div>
        )}
      </div>
      <TimeFrameButtons
        selected={selectedTimeFrame}
        onChange={onTimeFrameChage}
        loading={loading}
        options={timeFrames}
      />
    </div>
  );
};

export default Chart;
