import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROFILE_MESSAGES } from '../../constants/messages';
import { useAuth } from '../../hooks/auth-context';
import { handleAuthError, showErrorAlert, showSuccessAlert } from '../../utils/alertUtils';
import api from '../../utils/api';
import { formatDateOnly } from '../../utils/date';

const INQUIRY_STATUS_LABELS = {
  pending: '접수됨',
  in_progress: '처리 중',
  resolved: '처리 완료',
};

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [stats, setStats] = useState({ topics: 0, votes: 0, likes: 0 });
  const [activities, setActivities] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('avatar_url') || '');
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setError(PROFILE_MESSAGES.loginRequired);
        setLoading(false);
        setLoadingStats(false);
        setLoadingActivity(false);
        setLoadingInquiries(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/users/me');
        const data = res.data;
        const mapped = {
          name: data.username,
          email: data.email,
          joinedAt: data.created_at?.slice(0, 10) || '',
        };
        setUser(mapped);
        setForm({ name: mapped.name, email: mapped.email });
        setError('');
      } catch (err) {
        setUser(null);
        setError(PROFILE_MESSAGES.fetchFailed);
        if (!(await handleAuthError(err))) {
          showErrorAlert(err, PROFILE_MESSAGES.fetchFailed);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      if (!isAuthenticated) {
        setLoadingStats(false);
        return;
      }
      try {
        setLoadingStats(true);
        const res = await api.get('/users/stats');
        setStats({
          topics: res.data.topics ?? 0,
          votes: res.data.votes ?? 0,
          likes: res.data.likes ?? 0,
        });
      } catch (err) {
        setStats({ topics: 0, votes: 0, likes: 0 });
        if (!(await handleAuthError(err))) {
          showErrorAlert(err, PROFILE_MESSAGES.statsFetchFailed);
        }
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchActivity = async () => {
      if (!isAuthenticated) {
        setLoadingActivity(false);
        return;
      }
      try {
        setLoadingActivity(true);
        const res = await api.get('/users/activity');
        setActivities(res.data || []);
      } catch (err) {
        setActivities([]);
        if (!(await handleAuthError(err))) {
          showErrorAlert(err, PROFILE_MESSAGES.activityFetchFailed);
        }
      } finally {
        setLoadingActivity(false);
      }
    };

    const fetchInquiries = async () => {
      if (!isAuthenticated) {
        setLoadingInquiries(false);
        return;
      }
      try {
        setLoadingInquiries(true);
        const res = await api.get('/inquiries/me');
        setInquiries(res.data || []);
      } catch (err) {
        setInquiries([]);
        if (!(await handleAuthError(err))) {
          showErrorAlert(err, '문의 내역을 불러오지 못했습니다.');
        }
      } finally {
        setLoadingInquiries(false);
      }
    };

    fetchProfile();
    fetchStats();
    fetchActivity();
    fetchInquiries();
  }, [isAuthenticated]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      showErrorAlert(new Error(''), PROFILE_MESSAGES.nameRequired);
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/users/me', {
        username: form.name,
        email: form.email,
      });
      setUser({
        name: res.data.username,
        email: res.data.email,
        joinedAt: res.data.created_at?.slice(0, 10) || user?.joinedAt || '',
      });
      setEditMode(false);
      showSuccessAlert(PROFILE_MESSAGES.updateSuccess);
    } catch (err) {
      if (!(await handleAuthError(err))) {
        showErrorAlert(err, PROFILE_MESSAGES.updateFailed);
      }
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setForm({ name: user?.name || '', email: user?.email || '' });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-slate-500">
        <div className="animate-spin h-6 w-6 border-4 border-slate-400 border-t-transparent rounded-full mr-3" />
        <span>불러오는 중...</span>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-600">{error || PROFILE_MESSAGES.loginRequired}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-6 shadow-md">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-100 text-slate-800 flex items-center justify-center text-2xl font-bold border border-slate-300 shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-full w-full rounded-full object-cover border border-slate-200"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">{user?.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="작성한 토픽" value={loadingStats ? '...' : stats.topics} />
          <StatCard label="투표 횟수" value={loadingStats ? '...' : stats.votes} />
          <StatCard label="받은 좋아요" value={loadingStats ? '...' : stats.likes} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">계정 정보</h3>
              {editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="h-10 px-4 inline-flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 transition shadow-sm text-sm"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={saving}
                    className="h-10 px-4 inline-flex items-center justify-center bg-white text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition text-sm"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  className="h-10 px-4 inline-flex items-center justify-center bg-white text-slate-700 rounded-lg border border-slate-300 hover:border-slate-400 hover:text-slate-900 transition text-sm shadow-sm"
                  onClick={() => setEditMode(true)}
                >
                  프로필 수정
                </button>
              )}
            </div>
            <div className="space-y-3">
              <Field label="이름">
                {editMode ? (
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none shadow-inner"
                  />
                ) : (
                  <input
                    value={user?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                  />
                )}
              </Field>
              <Field label="이메일">
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                />
              </Field>
              <Field label="가입일">
                <input
                  value={user?.joinedAt || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                />
              </Field>
              <Field label="프로필 이미지" alignTop>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300 shadow-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-slate-700 font-semibold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <label className="px-3 py-2 text-sm bg-white text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-slate-900 cursor-pointer">
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const url = reader.result?.toString() || '';
                          setAvatarUrl(url);
                          localStorage.setItem('avatar_url', url);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      onClick={() => {
                        setAvatarUrl('');
                        localStorage.removeItem('avatar_url');
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      제거
                    </button>
                  )}
                </div>
              </Field>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">최근 활동</h3>
            </div>
            {loadingActivity ? (
              <p className="text-sm text-slate-500">불러오는 중...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-slate-500">최근 활동이 없습니다.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {activities.map((item, idx) => {
                  const topicId = item.topic_id;
                  return (
                    <ActivityRow
                      key={idx}
                      title={item.title}
                      date={formatDateOnly(item.created_at)}
                      onView={topicId ? () => navigate(`/topic/${topicId}`) : undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <InquiryHistorySection inquiries={inquiries} loading={loadingInquiries} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-md">
    <p className="text-sm text-slate-600 font-semibold">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1 py-2">
    <span className="text-sm text-slate-700 font-medium">{label}</span>
    <div className="text-sm text-slate-800">{children}</div>
  </div>
);

const ActivityRow = ({ title, date, onView }) => (
  <div className="flex flex-col gap-2 border-b last:border-0 py-3">
    <p className="text-sm font-medium text-slate-800 leading-relaxed line-clamp-2">{title}</p>
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>{date}</span>
      <button
        onClick={onView}
        disabled={!onView}
        className={`text-xs transition ${onView ? 'text-slate-500 hover:text-slate-800' : 'text-slate-300'}`}
      >
        보기
      </button>
    </div>
  </div>
);

const InquiryHistorySection = ({ inquiries, loading }) => (
  <section className="p-6 rounded-xl border border-slate-200 bg-white shadow-md space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">내 문의 내역</h3>
      <p className="mt-1 text-sm text-slate-500">
        접수한 문의의 처리 상태와 관리자 처리 사유를 확인할 수 있습니다.
      </p>
    </div>

    {loading ? (
      <p className="text-sm text-slate-500">문의 내역을 불러오는 중입니다.</p>
    ) : inquiries.length === 0 ? (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        아직 접수한 문의가 없습니다.
      </div>
    ) : (
      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <InquiryHistoryItem key={inquiry.inquiry_id} inquiry={inquiry} />
        ))}
      </div>
    )}
  </section>
);

const InquiryHistoryItem = ({ inquiry }) => {
  const statusLabel = INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status;

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
            {statusLabel}
          </span>
          <h4 className="mt-2 text-base font-semibold text-slate-900">{inquiry.title}</h4>
        </div>
        <span className="text-xs text-slate-500">{formatDateOnly(inquiry.created_at)}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">{inquiry.content}</p>

      {inquiry.latest_reason && (
        <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">처리 사유: </span>
          {inquiry.latest_reason}
        </div>
      )}
    </article>
  );
};

export default Profile;
