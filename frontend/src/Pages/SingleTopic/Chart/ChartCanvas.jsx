import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatDateTime } from '../../../utils/date';

const formatTooltipTimestamp = (timestamp) => {
  const formatted = formatDateTime(timestamp, 'ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatted || timestamp;
};

const CustomTooltip = ({ active, payload, metric, options }) => {
  if (!active || !payload?.length) return null;

  const rawTimestamp = payload[0]?.payload?.timestamp || payload[0]?.payload?.label || '';
  const timestamp = formatTooltipTimestamp(rawTimestamp);

  return (
    <div className="max-w-[260px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">{timestamp}</p>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const index = Number(String(item.name).split('_')[1]);
          const option = options[index] ?? item.name;
          const value = metric === 'percent' ? `${item.value}%` : `${item.value}표`;

          return (
            <div key={item.dataKey} className="flex min-w-0 items-start justify-between gap-3">
              <span className="flex min-w-0 items-start gap-1.5 text-slate-600">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words leading-snug">{option}</span>
              </span>
              <span className="shrink-0 font-semibold text-slate-900">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChartCanvas = ({ data, metric, options, colors, timeFrame }) => {
  const tickFormatter = (value) => {
    if (typeof value !== 'string') return value;
    return value;
  };

  return (
    <div className="vote-trend-chart h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          tickFormatter={tickFormatter}
          interval="preserveStartEnd"
          minTickGap={timeFrame === '1H' || timeFrame === '6H' ? 20 : 28}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          domain={metric === 'percent' ? [0, 100] : ['auto', 'auto']}
          tickFormatter={(v) => (metric === 'percent' ? `${v}%` : v)}
        />
        <Tooltip content={<CustomTooltip metric={metric} options={options} />} />
        {options.map((_, i) => (
          <Line
            key={i}
            type="monotone"
            dataKey={`${metric}_${i}`}
            name={`option_${i}`}
            stroke={colors[i]}
            strokeWidth={2}
            dot={false}
            connectNulls
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCanvas;
