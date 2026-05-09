import React from 'react';

function TimeFrameButtons({ selected, onChange, loading, options }) {
  return (
    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
      {options.map((frames, idx) => (
        <button
          key={idx}
          onClick={() => onChange(frames)}
          disabled={loading}
          className={`min-h-10 min-w-[58px] shrink-0 rounded-lg border px-3 py-2 text-sm font-bold transition-all duration-200 ${
            selected === frames
              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
          }`}
        >
          {frames}
        </button>
      ))}
    </div>
  );
}

export default TimeFrameButtons;
