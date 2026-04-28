import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ChartCanvas = ({ data, metric, options, colors, timeFrame }) => {
  const tickFormatter = (value) => {
    if (typeof value !== 'string') return value;
    return value;
  };

  return (
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
        <Tooltip
          labelFormatter={(_, payload) => payload?.[0]?.payload?.timestamp ?? ''}
          formatter={(value, name) => {
            const index = name.split('_')[1];
            return [metric === 'percent' ? `${value}%` : value, options[index]];
          }}
        />
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
  );
};

export default ChartCanvas;
