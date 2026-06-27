type TopicListControlsProps = {
  status: 'active' | 'all' | 'voted' | 'closed';
  sort: 'recent' | 'likes';
  onStatusChange: (status: TopicListControlsProps['status']) => void;
  onSortChange: (sort: TopicListControlsProps['sort']) => void;
};

const STATUS_OPTIONS: Array<{ label: string; value: TopicListControlsProps['status'] }> = [
  { label: '참여 가능', value: 'active' },
  { label: '전체', value: 'all' },
  { label: '투표 완료', value: 'voted' },
  { label: '종료됨', value: 'closed' },
];

const SORT_OPTIONS: Array<{ label: string; value: TopicListControlsProps['sort'] }> = [
  { label: '최신순', value: 'recent' },
  { label: '인기순', value: 'likes' },
];

const optionClassName = (isActive: boolean) =>
  `min-h-9 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 ${
    isActive
      ? 'bg-white text-slate-950 shadow-sm'
      : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
  }`;

const TopicListControls = ({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: TopicListControlsProps) => {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="inline-flex w-fit items-center gap-1 rounded-lg bg-slate-100 p-1"
        aria-label="토픽 참여 상태"
        role="group"
      >
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={optionClassName(status === option.value)}
            onClick={() => onStatusChange(option.value)}
            aria-pressed={status === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="inline-flex w-fit items-center gap-1 rounded-lg bg-slate-100 p-1"
        aria-label="토픽 정렬"
        role="group"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={optionClassName(sort === option.value)}
            onClick={() => onSortChange(option.value)}
            aria-pressed={sort === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicListControls;
