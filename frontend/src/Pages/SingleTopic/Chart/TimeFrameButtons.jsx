import React from 'react';

function TimeFrameButtons({ selected, onChange, loading, options }) {
  return (
    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
      {options.map((frames, idx) => (
        <button
          key={idx}
          onClick={() => onChange(frames)}
          disabled={loading}
          className={`min-h-11 min-w-[56px] shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-200 ${
            selected === frames
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
              : 'border-gray-300 hover:border-emerald-500'
          }`}
        >
          {frames}
        </button>
      ))}
    </div>
  );
}

export default TimeFrameButtons;
