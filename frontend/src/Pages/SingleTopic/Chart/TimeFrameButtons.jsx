import React from 'react';

function TimeFrameButtons({ selected, onChange, loading, options }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {options.map((frames, idx) => (
        <button
          key={idx}
          onClick={() => onChange(frames)}
          disabled={loading}
          className={`min-w-[56px] rounded-md border px-3 py-2 text-sm font-medium transition-all duration-200 ${
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
