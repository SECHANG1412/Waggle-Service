import React from 'react';

function TimeFrameButtons({ selected, onChange, loading, options }) {
  return (
    <div className="flex justify-center space-x-3 mt-4">
      {options.map((frames, idx) => (
        <button
          key={idx}
          onClick={() => onChange(frames)}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
            selected === frames
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
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
