import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const DATE_OPTIONS = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
];

const DELETE_REASONS = ['스팸', '욕설/비방', '개인정보', '광고', '기타'];

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getDateParams = (dateFilter) => {
  if (dateFilter === 'all') return {};
  const now = new Date();
  const start = new Date(now);

  if (dateFilter === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (dateFilter === '7d') {
    start.setDate(now.getDate() - 7);
  } else if (dateFilter === '30d') {
    start.setDate(now.getDate() - 30);
  }

  return {
    start_at: start.toISOString(),
    end_at: now.toISOString(),
  };
};

const StatusBadge = ({ archiveMode }) => (
  <span
    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
      archiveMode
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}
  >
    {archiveMode ? '삭제 보관' : '공개'}
  </span>
);

const ContentModerationPage = ({
  title,
  description,
  archiveMode = false,
  archivePath,
  listPath,
  listEndpoint,
  getItemId,
  getItemTitle,
  getItemDescription,
  getItemMeta,
  deleteEndpoint,
  restoreEndpoint,
}) => {
  const [items, setItems] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [reasonById, setReasonById] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionItemId, setActionItemId] = useState(null);

  const params = useMemo(() => {
    const nextParams = { ...getDateParams(dateFilter) };
    if (archiveMode) nextParams.status = 'deleted';
    return nextParams;
  }, [archiveMode, dateFilter]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await api.get(listEndpoint, { params });
      setItems(response.data);
    } catch {
      setMessage({ type: 'error', text: '목록을 불러오지 못했습니다.' });
    } finally {
      setIsLoading(false);
    }
  }, [listEndpoint, params]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const setReason = (itemId, value) => {
    setReasonById((prev) => ({ ...prev, [itemId]: value }));
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => getItemId(item) !== itemId));
  };

  const handleDelete = async (item) => {
    const itemId = getItemId(item);
    const reason = (reasonById[itemId] || '').trim();

    if (!reason) {
      setMessage({ type: 'error', text: '삭제 사유를 선택하거나 입력해주세요.' });
      return;
    }
    if (!window.confirm('이 항목을 삭제 처리하시겠습니까? 일반 사용자에게 보이지 않습니다.')) {
      return;
    }

    setActionItemId(itemId);
    setMessage(null);
    try {
      await api.patch(deleteEndpoint(itemId), { reason });
      removeItem(itemId);
      setReason(itemId, '');
      setMessage({ type: 'success', text: '삭제 처리했습니다. 삭제 보관함에서 확인할 수 있습니다.' });
    } catch {
      setMessage({ type: 'error', text: '삭제 처리하지 못했습니다.' });
    } finally {
      setActionItemId(null);
    }
  };

  const handleRestore = async (item) => {
    const itemId = getItemId(item);
    const reason = (reasonById[itemId] || '관리자 복구').trim();

    if (!window.confirm('이 항목을 복구하시겠습니까? 일반 사용자에게 다시 표시됩니다.')) {
      return;
    }

    setActionItemId(itemId);
    setMessage(null);
    try {
      await api.patch(restoreEndpoint(itemId), { reason });
      removeItem(itemId);
      setReason(itemId, '');
      setMessage({ type: 'success', text: '복구 처리했습니다. 기본 목록에서 확인할 수 있습니다.' });
    } catch {
      setMessage({ type: 'error', text: '복구 처리하지 못했습니다.' });
    } finally {
      setActionItemId(null);
    }
  };

  const messageColor = message?.type === 'success' ? 'text-emerald-700' : 'text-red-600';

  return (
    <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            관리자 홈
          </Link>
          <h1 className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="text-sm font-semibold text-slate-700">
            기간
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Link
            to={archiveMode ? listPath : archivePath}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {archiveMode ? '기본 목록' : '삭제 보관함'}
          </Link>
        </div>
      </div>

      {message && <p className={`mb-4 text-sm font-semibold ${messageColor}`}>{message.text}</p>}

      <section className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500">목록을 불러오는 중입니다.</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500">
            {archiveMode ? '삭제 보관함에 항목이 없습니다.' : '관리할 항목이 없습니다.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const itemId = getItemId(item);
              const isActionLoading = actionItemId === itemId;
              const reason = reasonById[itemId] || '';
              return (
                <li key={itemId} className="p-3 sm:p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-base font-semibold text-slate-900">
                          {getItemTitle(item)}
                        </h2>
                        <StatusBadge archiveMode={archiveMode} />
                      </div>
                      <p className="line-clamp-3 break-words text-sm leading-6 text-slate-600">
                        {getItemDescription(item)}
                      </p>
                      <dl className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        {getItemMeta(item).map((meta) => (
                          <div key={meta.label}>
                            <dt className="font-semibold text-slate-700">{meta.label}</dt>
                            <dd className="break-words">{meta.value}</dd>
                          </div>
                        ))}
                        <div>
                          <dt className="font-semibold text-slate-700">작성일</dt>
                          <dd>{formatDate(item.created_at)}</dd>
                        </div>
                        {archiveMode && (
                          <>
                            <div>
                              <dt className="font-semibold text-slate-700">삭제 처리일</dt>
                              <dd>{formatDate(item.hidden_at)}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-slate-700">처리 관리자 ID</dt>
                              <dd>{item.hidden_by ?? '-'}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>

                    <div className="w-full shrink-0 lg:w-80">
                      <label className="block text-sm font-semibold text-slate-700">
                        처리 사유
                        {!archiveMode && (
                          <select
                            value={reason}
                            onChange={(event) => setReason(itemId, event.target.value)}
                            className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">사유 선택</option>
                            {DELETE_REASONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </label>
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(itemId, event.target.value)}
                        rows={3}
                        placeholder={archiveMode ? '복구 사유를 입력할 수 있습니다.' : '직접 입력도 가능합니다.'}
                        className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6"
                      />
                      <button
                        type="button"
                        disabled={isActionLoading || (!archiveMode && !reason.trim())}
                        onClick={() => (archiveMode ? handleRestore(item) : handleDelete(item))}
                        className={`mt-3 min-h-11 w-full rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
                          archiveMode
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isActionLoading ? '처리 중' : archiveMode ? '복구' : '삭제'}
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
