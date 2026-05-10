import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'pending', label: '미처리' },
  { value: 'in_progress', label: '처리중' },
  { value: 'resolved', label: '완료' },
  { value: 'deleted', label: '삭제됨' },
];

const ACTIVE_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value && option.value !== 'deleted'
);

const DATE_OPTIONS = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
];

const STATUS_LABELS = {
  pending: '미처리',
  in_progress: '처리중',
  resolved: '완료',
  deleted: '삭제됨',
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  deleted: 'bg-red-50 text-red-700 border-red-200',
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

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
      STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-600'
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [nextStatus, setNextStatus] = useState('pending');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => {
    const nextParams = { ...getDateParams(dateFilter) };
    if (statusFilter) nextParams.status = statusFilter;
    return nextParams;
  }, [dateFilter, statusFilter]);

  const loadInquiries = useCallback(async () => {
    setIsListLoading(true);
    setMessage(null);
    try {
      const response = await api.get('/manage-api/inquiries', { params });
      setInquiries(response.data);
      setSelectedId((current) => {
        if (current && response.data.some((inquiry) => inquiry.inquiry_id === current)) {
          return current;
        }
        return response.data[0]?.inquiry_id ?? null;
      });
    } catch {
      setMessage({ type: 'error', text: '문의 목록을 불러오지 못했습니다.' });
    } finally {
      setIsListLoading(false);
    }
  }, [params]);

  const loadInquiryDetail = useCallback(async (inquiryId) => {
    if (!inquiryId) {
      setSelectedInquiry(null);
      return;
    }

    setIsDetailLoading(true);
    setMessage(null);
    try {
      const response = await api.get(`/manage-api/inquiries/${inquiryId}`);
      setSelectedInquiry(response.data);
      setNextStatus(response.data.status === 'deleted' ? 'resolved' : response.data.status);
      setReason('');
    } catch {
      setMessage({ type: 'error', text: '문의 상세를 불러오지 못했습니다.' });
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useEffect(() => {
    loadInquiryDetail(selectedId);
  }, [loadInquiryDetail, selectedId]);

  const replaceInquiry = (updated) => {
    setSelectedInquiry(updated);
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.inquiry_id === updated.inquiry_id ? updated : inquiry
      )
    );
  };

  const handleStatusChange = async (event) => {
    event.preventDefault();

    const trimmedReason = reason.trim();
    if (!selectedInquiry || !trimmedReason) {
      setMessage({ type: 'error', text: '처리 사유를 입력해주세요.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await api.patch(
        `/manage-api/inquiries/${selectedInquiry.inquiry_id}/status`,
        {
          status: nextStatus,
          reason: trimmedReason,
        }
      );
      replaceInquiry(response.data);
      setReason('');
      setMessage({ type: 'success', text: '문의 상태를 변경했습니다.' });
    } catch {
      setMessage({ type: 'error', text: '문의 상태를 변경하지 못했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;
    const trimmedReason = reason.trim() || '완료 문의 정리';
    if (!window.confirm('이 문의를 삭제 처리하시겠습니까? 기본 목록에서 제외됩니다.')) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await api.patch(
        `/manage-api/inquiries/${selectedInquiry.inquiry_id}/delete`,
        { reason: trimmedReason }
      );
      replaceInquiry(response.data);
      setReason('');
      setMessage({ type: 'success', text: '문의를 삭제 처리했습니다.' });
    } catch {
      setMessage({ type: 'error', text: '문의를 삭제 처리하지 못했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedInquiry) return;
    const trimmedReason = reason.trim() || '관리자 복구';
    if (!window.confirm('이 문의를 복구하시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await api.patch(
        `/manage-api/inquiries/${selectedInquiry.inquiry_id}/restore`,
        { status: nextStatus, reason: trimmedReason }
      );
      replaceInquiry(response.data);
      setReason('');
      setMessage({ type: 'success', text: '문의를 복구했습니다.' });
    } catch {
      setMessage({ type: 'error', text: '문의를 복구하지 못했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageColor = message?.type === 'success' ? 'text-emerald-700' : 'text-red-600';
  const isDeleted = selectedInquiry?.status === 'deleted';

  return (
    <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            관리자 홈
          </Link>
          <h1 className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">문의 관리</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            문의 상태를 처리하고 완료된 문의를 삭제 처리합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            상태
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

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
        </div>
      </div>

      {message && <p className={`mb-4 text-sm font-semibold ${messageColor}`}>{message.text}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">문의 목록</h2>
          </div>

          {isListLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500">문의 목록을 불러오는 중입니다.</p>
          ) : inquiries.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">조건에 맞는 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {inquiries.map((inquiry) => {
                const selected = inquiry.inquiry_id === selectedId;
                return (
                  <li key={inquiry.inquiry_id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(inquiry.inquiry_id)}
                      className={`w-full px-4 py-4 text-left transition ${
                        selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">{inquiry.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {inquiry.name} · {inquiry.email}
                          </p>
                        </div>
                        <StatusBadge status={inquiry.status} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        접수일 {formatDate(inquiry.created_at)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">문의 상세</h2>
          </div>

          {isDetailLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500">문의 상세를 불러오는 중입니다.</p>
          ) : !selectedInquiry ? (
            <p className="px-4 py-8 text-sm text-slate-500">선택된 문의가 없습니다.</p>
          ) : (
            <div className="space-y-5 p-4">
              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="break-words text-lg font-bold text-slate-900">{selectedInquiry.title}</h3>
                  <StatusBadge status={selectedInquiry.status} />
                </div>
                <dl className="grid gap-2 text-sm text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-800">작성자</dt>
                    <dd>{selectedInquiry.name}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">이메일</dt>
                    <dd>{selectedInquiry.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">접수일</dt>
                    <dd>{formatDate(selectedInquiry.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">수정일</dt>
                    <dd>{formatDate(selectedInquiry.updated_at)}</dd>
                  </div>
                </dl>
              </div>

              <div className="break-words rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selectedInquiry.content}
              </div>

              <form onSubmit={handleStatusChange} className="space-y-4 border-t border-slate-200 pt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  처리 상태
                  <select
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                    className="mt-2 block min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {ACTIVE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  처리 사유
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="처리 또는 삭제 사유를 입력해주세요."
                    className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6"
                  />
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  {isDeleted ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRestore}
                      className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isSubmitting ? '처리 중' : '복구'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !reason.trim()}
                      className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isSubmitting ? '처리 중' : '상태 변경'}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting || isDeleted}
                    onClick={handleDelete}
                    className="min-h-11 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    삭제
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default AdminInquiries;
