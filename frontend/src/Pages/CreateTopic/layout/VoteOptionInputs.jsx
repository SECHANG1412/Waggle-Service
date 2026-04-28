import React from 'react';

const VoteOptionInputs = ({ formData, onOptionAdd, onOptionRemove, onOptionChange }) => {
  const voteOptions = formData.vote_options;
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        투표 옵션 <span className="text-red-500">*</span>
      </label>
      {voteOptions.map((option, index) => (
        <div key={index} className="mb-2 flex gap-2">
          <input
            type="text"
            value={option}
            onChange={(e) => onOptionChange(index, e.target.value)}
            required
            placeholder={`옵션 ${index + 1}`}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          {voteOptions.length > 1 && (
            <button
              type="button"
              onClick={() => onOptionRemove(index)}
              className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-800"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      {voteOptions.length < 4 && (
        <button
          type="button"
          onClick={onOptionAdd}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          옵션 추가
        </button>
      )}
    </div>
  );
};

export default VoteOptionInputs;
