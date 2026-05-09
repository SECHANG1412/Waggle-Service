import React from 'react';

const VoteOptionInputs = ({ formData, onOptionChange }) => {
  const voteOptions = formData.vote_options;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700">
          투표 옵션 <span className="text-red-500">*</span>
        </label>
        <span className="text-xs font-medium text-slate-500">정확히 2개</span>
      </div>
      <div className="space-y-2">
        {voteOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => onOptionChange(index, e.target.value)}
            required
            placeholder={`옵션 ${index + 1}`}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        토픽은 두 선택지 중 하나를 고르는 방식으로 생성됩니다.
      </p>
    </div>
  );
};

export default VoteOptionInputs;
