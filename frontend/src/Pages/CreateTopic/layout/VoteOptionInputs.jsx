import React from 'react';

const VoteOptionInputs = ({ formData, onOptionChange }) => {
  const voteOptions = formData.vote_options;

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-semibold text-slate-700">
          투표 옵션 <span className="text-red-500">*</span>
        </label>
      </div>
      <div className="space-y-2">
        {voteOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => onOptionChange(index, e.target.value)}
            required
            placeholder={`선택지 ${index + 1}`}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        ))}
      </div>
    </div>
  );
};

export default VoteOptionInputs;
