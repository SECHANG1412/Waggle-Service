import React from 'react';

const ChartLegend = ({ options, colors }) => {
  if (!options?.length || !colors?.length) return null;

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
      {options.map((option, index) => (
        <div key={`${option}-${index}`} className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors[index] }}
            aria-hidden="true"
          />
          <span className="min-w-0 break-words leading-snug">{option}</span>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
