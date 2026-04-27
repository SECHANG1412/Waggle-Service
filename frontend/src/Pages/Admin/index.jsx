import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ACTION_LABELS = {
  UPDATE_INQUIRY_STATUS: '문의 상태 변경',
  HIDE_TOPIC: '토픽 숨김',
  UNHIDE_TOPIC: '토픽 숨김 해제',
  HIDE_COMMENT: '댓글 숨김',
  UNHIDE_COMMENT: '댓글 숨김 해제',
};

const STATUS_LABELS = {
  pending: '대기',
  in_progress: '처리 중',
  resolved: '해결',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const StatCard = ({ label, value, to }) => (
  <Link
    to={to}
    className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-blue-50"
  >
    <p className="text-sm font-semibold text-slate-600">{label}</p>
    <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
  </Link>
);

const Admin = () => {
  const [inquiries, setInquiries] = useState([]);
  const [topics, setTopics] = useState([]);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const [inquiriesResponse, topicsResponse, commentsResponse, logsResponse] =
        await Promise.all([
          api.get('/manage-api/inquiries'),
          api.get('/manage-api/topics'),
          api.get('/manage-api/comments'),
          api.get('/manage-api/logs', { params: { limit: 5 } }),
        ]);

      setInquiries(inquiriesResponse.data);
      setTopics(topicsResponse.data);
      setComments(commentsResponse.data);
      setLogs(logsResponse.data);
    } catch {
      setMessage({ type: 'error', text: '관리자 대시보드 정보를 불러오지 못했습니다.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    return {
      pendingInquiries: inquiries.filter((inquiry) => inquiry.status === 'pending').length,
      inProgressInquiries: inquiries.filter((inquiry) => inquiry.status === 'in_progress').length,
      hiddenTopics: topics.filter((topic) => topic.is_hidden).length,
      hiddenComments: comments.filter((comment) => comment.is_hidden).length,
    };
  }, [comments, inquiries, topics]);

  const recentInquiries = useMemo(() => {
    return [...inquiries]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [inquiries]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">관리자</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">운영 대시보드</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            문의 처리 현황, 숨김 콘텐츠, 최근 관리자 작업 이력을 한눈에 확인합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={isLoading}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {isLoading ? '불러오는 중' : '새로고침'}
        </button>
      </div>

      {message && <p className="mb-4 text-sm font-semibold text-red-600">{message.text}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="처리 대기 문의" value={stats.pendingInquiries} to="/manage/inquiries" />
        <StatCard label="처리 중 문의" value={stats.inProgressInquiries} to="/manage/inquiries" />
        <StatCard label="숨김 토픽" value={stats.hiddenTopics} to="/manage/topics" />
        <StatCard label="숨김 댓글" value={stats.hiddenComments} to="/manage/comments" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">최근 문의</h2>
            <Link to="/manage/inquiries" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              전체 보기
            </Link>
          </div>

          {isLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500">최근 문의를 불러오고 있습니다.</p>
          ) : recentInquiries.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">접수된 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.inquiry_id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{inquiry.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {inquiry.name} · {formatDate(inquiry.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {STATUS_LABELS[inquiry.status] || inquiry.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">최근 관리자 작업</h2>
            <Link to="/manage/logs" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              전체 보기
            </Link>
          </div>

          {isLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500">최근 작업을 불러오고 있습니다.</p>
          ) : logs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">기록된 관리자 작업이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {logs.map((log) => (
                <li key={log.log_id} className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {log.target_type} #{log.target_id}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{log.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    관리자 ID {log.admin_user_id} · {formatDate(log.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">바로가기</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/manage/inquiries"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            문의 관리
          </Link>
          <Link
            to="/manage/topics"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            토픽 관리
          </Link>
          <Link
            to="/manage/comments"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            댓글 관리
          </Link>
          <Link
            to="/manage/logs"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            감사 로그
          </Link>
        </div>
      </section>
    </section>
  );
};

export default Admin;
