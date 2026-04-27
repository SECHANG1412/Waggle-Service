import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '처리 중' },
  { value: 'resolved', label: '해결' },
];

const STATUS_LABELS = {
  pending: '대기',
  in_progress: '처리 중',
  resolved: '해결',
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [nextStatus, setNextStatus] = useState('pending');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInquiries = useMemo(() => {
    if (statusFilter === 'all') return inquiries;
    return inquiries.filter((inquiry) => inquiry.status === statusFilter);
  }, [inquiries, statusFilter]);

  const loadInquiries = useCallback(async () => {
    setIsListLoading(true);
    setMessage(null);
    try {
      const response = await api.get('/manage-api/inquiries');
      setInquiries(response.data);
      if (response.data.length > 0) {
        setSelectedId((current) => current ?? response.data[0].inquiry_id);
      }
    } catch {
      setMessage({ type: 'error', text: '문의 목록을 불러오지 못했습니다.' });
    } finally {
      setIsListLoading(false);
    }
  }, []);

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
      setNextStatus(response.data.status);
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

  const handleStatusChange = async (event) => {
    event.preventDefault();

    const trimmedReason = reason.trim();
    if (!selectedInquiry || !trimmedReason) {
      setMessage({ type: 'error', text: '상태 변경 사유를 입력해야 합니다.' });
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
      const updated = response.data;
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.inquiry_id === updated.inquiry_id ? updated : inquiry
        )
      );
      setReason('');
      setMessage({ type: 'success', text: '문의 상태를 변경했습니다.' });
    } catch {
      setMessage({ type: 'error', text: '문의 상태 변경에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="mt-3 text-3xl font-bold text-slate-900">문의 관리</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            접수된 문의를 확인하고 처리 상태와 변경 사유를 기록합니다.
          </p>
        </div>

        <label className="text-sm font-semibold text-slate-700">
          상태 필터
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && <p className={`mb-4 text-sm font-semibold ${messageColor}`}>{message.text}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">문의 목록</h2>
          </div>

          {isListLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500">문의 목록을 불러오고 있습니다.</p>
          ) : filteredInquiries.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">조건에 맞는 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredInquiries.map((inquiry) => {
                const isSelected = inquiry.inquiry_id === selectedId;
                return (
                  <li key={inquiry.inquiry_id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(inquiry.inquiry_id)}
                      className={`w-full px-4 py-4 text-left transition ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{inquiry.title}</p>
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
            <p className="px-4 py-8 text-sm text-slate-500">문의 상세를 불러오고 있습니다.</p>
          ) : !selectedInquiry ? (
            <p className="px-4 py-8 text-sm text-slate-500">선택된 문의가 없습니다.</p>
          ) : (
            <div className="space-y-5 p-4">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{selectedInquiry.title}</h3>
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

              <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selectedInquiry.content}
              </div>

              <form onSubmit={handleStatusChange} className="space-y-4 border-t border-slate-200 pt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  처리 상태
                  <select
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                    className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  변경 사유
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="상태 변경 사유를 입력하세요."
                    className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !reason.trim()}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? '변경 중' : '상태 변경'}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default AdminInquiries;
