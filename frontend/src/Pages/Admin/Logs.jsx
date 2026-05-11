import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ACTION_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'UPDATE_INQUIRY_STATUS', label: '문의 상태 변경' },
  { value: 'DELETE_INQUIRY', label: '문의 삭제' },
  { value: 'DELETE_TOPIC', label: '토픽 삭제' },
  { value: 'DELETE_COMMENT', label: '댓글 삭제' },
];

const TARGET_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'Inquiry', label: '문의' },
  { value: 'Topic', label: '토픽' },
  { value: 'Comment', label: '댓글' },
];

const DATE_OPTIONS = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
];

const ACTION_LABELS = Object.fromEntries(
  ACTION_OPTIONS.filter((option) => option.value).map((option) => [option.value, option.label])
);

const TARGET_TYPE_LABELS = Object.fromEntries(
  TARGET_TYPE_OPTIONS.filter((option) => option.value).map((option) => [option.value, option.label])
);

const STATUS_LABELS = {
  pending: '미처리',
  in_progress: '처리중',
  resolved: '완료',
};

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

const getTargetName = (log) => {
  const snapshot = log.before_value || {};
  if (log.target_type === 'Topic') return snapshot.title || `토픽 #${log.target_id}`;
  if (log.target_type === 'Comment') return snapshot.content || `댓글 #${log.target_id}`;
  if (log.target_type === 'Inquiry') return snapshot.title || `문의 #${log.target_id}`;
  return `${log.target_type} #${log.target_id}`;
};

const buildLogSentence = (log) => {
  const targetLabel = TARGET_TYPE_LABELS[log.target_type] || log.target_type;
  const targetName = getTargetName(log);

  if (log.action === 'UPDATE_INQUIRY_STATUS') {
    return `관리자 ID ${log.admin_user_id}이 ${targetLabel} "${targetName}"의 상태를 변경`;
  }
  if (log.action?.startsWith('DELETE_')) {
    return `관리자 ID ${log.admin_user_id}이 ${targetLabel} "${targetName}"을 영구 삭제`;
  }
  return `관리자 ID ${log.admin_user_id}이 ${targetLabel} "${targetName}"을 처리`;
};

const buildSummaryRows = (log) => {
  const snapshot = log.before_value || {};
  if (log.action === 'UPDATE_INQUIRY_STATUS') {
    return [
      {
        label: '상태 변경',
        value: `${STATUS_LABELS[snapshot.status] || snapshot.status || '-'} -> ${
          STATUS_LABELS[log.after_value?.status] || log.after_value?.status || '-'
        }`,
      },
    ];
  }

  if (log.action === 'DELETE_TOPIC') {
    return [
      { label: '처리 내용', value: '토픽 영구 삭제' },
      { label: '토픽 제목', value: snapshot.title || '-' },
      { label: '작성자 ID', value: snapshot.author_id ?? '-' },
      { label: '카테고리', value: snapshot.category || '-' },
    ];
  }

  if (log.action === 'DELETE_COMMENT') {
    return [
      { label: '처리 내용', value: '댓글 영구 삭제' },
      { label: '댓글 내용', value: snapshot.content || '-' },
      { label: '작성자 ID', value: snapshot.author_id ?? '-' },
      { label: '토픽 ID', value: snapshot.topic_id ?? '-' },
    ];
  }

  if (log.action === 'DELETE_INQUIRY') {
    return [
      { label: '처리 내용', value: '문의 영구 삭제' },
      { label: '문의 제목', value: snapshot.title || '-' },
      { label: '작성자', value: snapshot.name || '-' },
      { label: '이메일', value: snapshot.email || '-' },
    ];
  }

  return [{ label: '처리 내용', value: ACTION_LABELS[log.action] || log.action }];
};

const RawJsonPreview = ({ log }) => (
  <details className="rounded-md bg-slate-50 p-3">
    <summary className="cursor-pointer text-xs font-semibold text-slate-700">원본 기록 보기</summary>
    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      <pre className="max-h-44 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-slate-700">
        {JSON.stringify(log.before_value, null, 2)}
      </pre>
      <pre className="max-h-44 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-slate-700">
        {JSON.stringify(log.after_value, null, 2)}
      </pre>
    </div>
  </details>
);

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    adminUserId: '',
    date: 'all',
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useMemo(() => {
    const nextParams = { limit: 100, ...getDateParams(filters.date) };
    if (filters.action) nextParams.action = filters.action;
    if (filters.targetType) nextParams.target_type = filters.targetType;
    if (filters.adminUserId.trim()) {
      nextParams.admin_user_id = filters.adminUserId.trim();
    }
    return nextParams;
  }, [filters]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await api.get('/manage-api/logs', { params });
      setLogs(response.data);
    } catch {
      setMessage({ type: 'error', text: '감사 로그를 불러오지 못했습니다.' });
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ action: '', targetType: '', adminUserId: '', date: 'all' });
  };

  return (
    <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6">
        <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          관리자 홈
        </Link>
        <h1 className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">감사 로그</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          관리자 조치의 대상, 사유, 변경 내용을 확인합니다.
        </p>
      </div>

      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">
            조치
            <select
              value={filters.action}
              onChange={(event) => updateFilter('action', event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            대상
            <select
              value={filters.targetType}
              onChange={(event) => updateFilter('targetType', event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            기간
            <select
              value={filters.date}
              onChange={(event) => updateFilter('date', event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            관리자 ID
            <input
              value={filters.adminUserId}
              onChange={(event) => updateFilter('adminUserId', event.target.value)}
              inputMode="numeric"
              placeholder="예: 1"
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-11 w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </section>

      {message && <p className="mb-4 text-sm font-semibold text-red-600">{message.text}</p>}

      <section className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500">감사 로그를 불러오는 중입니다.</p>
        ) : logs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500">조건에 맞는 감사 로그가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.log_id} className="p-3 sm:p-4">
                <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {TARGET_TYPE_LABELS[log.target_type] || log.target_type} #{log.target_id}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                      {buildLogSentence(log)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(log.created_at)}</p>
                  </div>
                  <p className="text-xs text-slate-500">로그 ID {log.log_id}</p>
                </div>

                <div className="mb-3 break-words text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-900">사유: </span>
                  {log.reason}
                </div>

                <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">처리 요약</p>
                  <dl className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    {buildSummaryRows(log).map((row) => (
                      <div key={row.label}>
                        <dt className="font-semibold text-slate-900">{row.label}</dt>
                        <dd className="break-words">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <RawJsonPreview log={log} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default AdminLogs;
