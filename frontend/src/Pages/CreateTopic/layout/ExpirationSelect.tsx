type ExpirationPreset = '1d' | '3d' | '7d' | '14d' | 'custom';

type ExpirationSelectProps = {
  dateValue: string;
  timeValue: string;
  preset: ExpirationPreset;
  minDate: string;
  onPresetChange: (preset: ExpirationPreset) => void;
  onCustomDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

const PRESET_OPTIONS: { label: string; value: ExpirationPreset }[] = [
  { label: '1일', value: '1d' },
  { label: '3일', value: '3d' },
  { label: '7일', value: '7d' },
  { label: '14일', value: '14d' },
  { label: '직접 설정', value: 'custom' },
];

const TIME_OPTIONS = ['00:00', '12:00', '18:00', '23:59'];

const ExpirationSelect = ({
  dateValue,
  timeValue,
  preset,
  minDate,
  onPresetChange,
  onCustomDateChange,
  onTimeChange,
}: ExpirationSelectProps) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      마감 시간 <span className="text-red-500">*</span>
    </label>

    <div className="flex flex-wrap gap-2">
      {PRESET_OPTIONS.map((option) => {
        const isSelected = preset === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onPresetChange(option.value)}
            className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>

    {preset === 'custom' && (
      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">마감 날짜</label>
        <input
          type="date"
          value={dateValue}
          min={minDate}
          onChange={(event) => onCustomDateChange(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
    )}

    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-slate-600">마감 시각</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIME_OPTIONS.map((time) => {
          const isSelected = timeValue === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onTimeChange(time)}
              className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>

    <p className="mt-1.5 text-xs text-slate-500">
      기본값은 7일 뒤 23:59입니다. 마감 시간이 지나면 투표가 자동으로 종료되고 결과만 볼 수 있습니다.
    </p>
  </div>
);

export default ExpirationSelect;
export type { ExpirationPreset };
