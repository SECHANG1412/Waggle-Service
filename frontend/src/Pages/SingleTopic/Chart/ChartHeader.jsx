import React from 'react';

const ChartHeader = ({ chartMetric, setChartMetric, loading }) => {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-lg font-semibold text-gray-700">투표 트렌드</h2>
      <select
        value={chartMetric}
        onChange={(e) => setChartMetric(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm sm:w-auto"
        disabled={loading}
      >
        <option value="count">투표 수</option>
        <option value="percent">비율 (%)</option>
      </select>
    </div>
  );
};

export default ChartHeader;
