import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ACTION_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'UPDATE_INQUIRY_STATUS', label: '문의 상태 변경' },
  { value: 'HIDE_TOPIC', label: '토픽 숨김' },
  { value: 'UNHIDE_TOPIC', label: '토픽 숨김 해제' },
  { value: 'HIDE_COMMENT', label: '댓글 숨김' },
  { value: 'UNHIDE_COMMENT', label: '댓글 숨김 해제' },
];

const TARGET_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'Inquiry', label: '문의' },
  { value: 'Topic', label: '토픽' },
  { value: 'Comment', label: '댓글' },
];

const ACTION_LABELS = Object.fromEntries(
  ACTION_OPTIONS.filter((option) => option.value).map((option) => [option.value, option.label])
);

const TARGET_TYPE_LABELS = Object.fromEntries(
  TARGET_TYPE_OPTIONS.filter((option) => option.value).map((option) => [option.value, option.label])
);

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const JsonPreview = ({ label, value }) => (
  <div>
    <dt className="mb-1 text-xs font-semibold text-slate-700">{label}</dt>
    <dd>
      <pre className="max-h-40 overflow-auto rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </dd>
  </div>
);

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    adminUserId: '',
  });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useMemo(() => {
    const nextParams = { limit: 100 };
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
    setFilters({ action: '', targetType: '', adminUserId: '' });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          관리자 홈
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">감사 로그</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          관리자 조치 이력과 사유, 변경 전후 값을 확인합니다.
        </p>
      </div>

      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            작업 유형
            <select
              value={filters.action}
              onChange={(event) => updateFilter('action', event.target.value)}
              className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            대상 유형
            <select
              value={filters.targetType}
              onChange={(event) => updateFilter('targetType', event.target.value)}
              className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
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
              className="mt-2 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </section>

      {message && <p className="mb-4 text-sm font-semibold text-red-600">{message.text}</p>}

      <section className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-500">감사 로그를 불러오고 있습니다.</p>
        ) : logs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500">조건에 맞는 감사 로그가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.log_id} className="p-4">
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
                    <p className="mt-2 text-sm text-slate-600">
                      관리자 ID {log.admin_user_id} · {formatDate(log.created_at)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">로그 ID {log.log_id}</p>
                </div>

                <dl className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <dt className="mb-1 text-xs font-semibold text-slate-700">사유</dt>
                    <dd className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      {log.reason}
                    </dd>
                  </div>
                  <JsonPreview label="변경 전" value={log.before_value} />
                  <JsonPreview label="변경 후" value={log.after_value} />
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default AdminLogs;
