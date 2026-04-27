import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'visible', label: '노출 중' },
  { value: 'hidden', label: '숨김' },
];

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const VisibilityBadge = ({ isHidden }) => (
  <span
    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
      isHidden
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}
  >
    {isHidden ? '숨김' : '노출 중'}
  </span>
);

const ContentModerationPage = ({
  title,
  description,
  listEndpoint,
  getItemId,
  getItemTitle,
  getItemDescription,
  getItemMeta,
  hideEndpoint,
  unhideEndpoint,
}) => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reasonById, setReasonById] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionItemId, setActionItemId] = useState(null);

  const filteredItems = useMemo(() => {
    if (filter === 'visible') return items.filter((item) => !item.is_hidden);
    if (filter === 'hidden') return items.filter((item) => item.is_hidden);
    return items;
  }, [filter, items]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await api.get(listEndpoint);
      setItems(response.data);
    } catch {
      setMessage({ type: 'error', text: '콘텐츠 목록을 불러오지 못했습니다.' });
    } finally {
      setIsLoading(false);
    }
  }, [listEndpoint]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const setReason = (itemId, value) => {
    setReasonById((prev) => ({ ...prev, [itemId]: value }));
  };

  const updateItem = (updatedItem) => {
    const updatedItemId = getItemId(updatedItem);
    setItems((prev) =>
      prev.map((item) => (getItemId(item) === updatedItemId ? updatedItem : item))
    );
  };

  const handleModeration = async (item, nextHidden) => {
    const itemId = getItemId(item);
    const reason = (reasonById[itemId] || '').trim();

    if (!reason) {
      setMessage({ type: 'error', text: '조치 사유를 입력해야 합니다.' });
      return;
    }

    setActionItemId(itemId);
    setMessage(null);
    try {
      const endpoint = nextHidden ? hideEndpoint(itemId) : unhideEndpoint(itemId);
      const response = await api.patch(endpoint, { reason });
      updateItem(response.data);
      setReason(itemId, '');
      setMessage({
        type: 'success',
        text: nextHidden ? '콘텐츠를 숨김 처리했습니다.' : '콘텐츠 숨김을 해제했습니다.',
      });
    } catch {
      setMessage({ type: 'error', text: '콘텐츠 조치에 실패했습니다.' });
    } finally {
      setActionItemId(null);
    }
  };

  const messageColor = message?.type === 'success' ? 'text-emerald-700' : 'text-red-600';

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            관리자 홈
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <label className="text-sm font-semibold text-slate-700">
          노출 상태
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && <p className={`mb-4 text-sm font-semibold ${messageColor}`}>{message.text}</p>}

      <section className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500">콘텐츠 목록을 불러오고 있습니다.</p>
        ) : filteredItems.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500">조건에 맞는 콘텐츠가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const itemId = getItemId(item);
              const isActionLoading = actionItemId === itemId;
              const reason = reasonById[itemId] || '';
              return (
                <li key={itemId} className="p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900">
                          {getItemTitle(item)}
                        </h2>
                        <VisibilityBadge isHidden={item.is_hidden} />
                      </div>
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {getItemDescription(item)}
                      </p>
                      <dl className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                        {getItemMeta(item).map((meta) => (
                          <div key={meta.label}>
                            <dt className="font-semibold text-slate-700">{meta.label}</dt>
                            <dd>{meta.value}</dd>
                          </div>
                        ))}
                        <div>
                          <dt className="font-semibold text-slate-700">숨김 처리일</dt>
                          <dd>{formatDate(item.hidden_at)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700">처리 관리자 ID</dt>
                          <dd>{item.hidden_by ?? '-'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="w-full shrink-0 lg:w-80">
                      <label className="block text-sm font-semibold text-slate-700">
                        조치 사유
                        <textarea
                          value={reason}
                          onChange={(event) => setReason(itemId, event.target.value)}
                          rows={3}
                          placeholder="숨김 또는 해제 사유를 입력하세요."
                          className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={isActionLoading || !reason.trim()}
                        onClick={() => handleModeration(item, !item.is_hidden)}
                        className={`mt-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
                          item.is_hidden
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isActionLoading
                          ? '처리 중'
                          : item.is_hidden
                            ? '숨김 해제'
                            : '숨김 처리'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
};

export default ContentModerationPage;
