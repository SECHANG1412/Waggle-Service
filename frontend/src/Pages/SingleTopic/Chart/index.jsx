import React, { useCallback, useEffect, useState } from 'react';
import { useVote } from '../../../hooks/useVote';
import ChartHeader from './ChartHeader';
import ChartCanvas from './ChartCanvas';
import { voteColors } from '../../../constants/voteColors';
import TimeFrameButtons from './TimeFrameButtons';

const timeFrames = ['1H', '6H', '1D', '1W', '1M', 'ALL'];

const Chart = ({ topicId, voteOptions }) => {
  const { getTopicVotes } = useVote();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('ALL');
  const [chartMetric, setChartMetric] = useState('count');
  const [loading, SetLoading] = useState(false);
  const [voteData, setVoteData] = useState([]);

  const fetchTopicVotes = useCallback(
    async (frame) => {
      if (!topicId) return;
      SetLoading(true);

      const tmpVoteData = await getTopicVotes(topicId, frame);
      if (tmpVoteData) {
        const chartData = Object.entries(tmpVoteData).map(([_, d]) => ({
          time: d.formattedTime,
          ...Object.entries(d).reduce(
            (acc, [k, v]) =>
              typeof v === 'object'
                ? {
                    ...acc,
                    [`count_${k}`]: v.count || 0,
                    [`percent_${k}`]: v.percent || 0,
                  }
                : acc,
            {}
          ),
        }));

        setVoteData(chartData);
      }

      SetLoading(false);
    },
    [topicId, getTopicVotes]
  );

  useEffect(() => {
    fetchTopicVotes('ALL');
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
      <div className="overflow-hidden">
        <div className="w-full">
          <ChartCanvas
            data={voteData}
            metric={chartMetric}
            options={voteOptions}
            colors={voteColors[voteOptions.length]}
            timeFrame={selectedTimeFrame}
          />
        </div>
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
