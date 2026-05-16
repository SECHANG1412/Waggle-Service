import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChevronRight,
  FaCommentDots,
  FaHeart,
  FaPoll,
  FaRegFileAlt,
  FaShieldAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { PROFILE_MESSAGES } from '../../constants/messages';
import { useAuth } from '../../hooks/auth-context';
import { handleAuthError, showErrorAlert, showSuccessAlert } from '../../utils/alertUtils';
import api from '../../utils/api';
import { formatDateOnly } from '../../utils/date';

const INQUIRY_STATUS_LABELS = {
  pending: '대기 중',
  in_progress: '처리 중',
  resolved: '처리 완료',
};

const CONTENT_STATUS_LABELS = {
  topic: '토픽',
  comment: '댓글',
};

const CONTENT_STATUS_NOTICE =
  '관리자 조치가 적용된 콘텐츠입니다. 추가 확인이 필요하면 문의를 남겨주세요.';

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [stats, setStats] = useState({ topics: 0, votes: 0, likes: 0 });
  const [activities, setActivities] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [contentStatus, setContentStatus] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('avatar_url') || '');
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [loadingContentStatus, setLoadingContentStatus] = useState(true);
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
        setLoadingContentStatus(false);
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

    const fetchContentStatus = async () => {
      if (!isAuthenticated) {
        setLoadingContentStatus(false);
        return;
      }
      try {
        setLoadingContentStatus(true);
        const res = await api.get('/users/content-status');
        setContentStatus(res.data || []);
      } catch (err) {
        setContentStatus([]);
        if (!(await handleAuthError(err))) {
          showErrorAlert(err, '콘텐츠 조치 내역을 불러오지 못했습니다.');
        }
      } finally {
        setLoadingContentStatus(false);
      }
    };

    fetchProfile();
    fetchStats();
    fetchActivity();
    fetchInquiries();
    fetchContentStatus();
  }, [isAuthenticated]);

  const statItems = useMemo(
    () => [
      { label: '작성한 토픽', value: stats.topics, icon: FaRegFileAlt, tone: 'blue' },
      { label: '투표 참여', value: stats.votes, icon: FaPoll, tone: 'emerald' },
      { label: '받은 좋아요', value: stats.likes, icon: FaHeart, tone: 'rose' },
    ],
    [stats]
  );

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

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result?.toString() || '';
      setAvatarUrl(url);
      localStorage.setItem('avatar_url', url);
    };
    reader.readAsDataURL(file);
  };

  const resetAvatar = () => {
    setAvatarUrl('');
    localStorage.removeItem('avatar_url');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-slate-400 border-t-transparent" />
        <span>프로필을 불러오는 중...</span>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">{error || PROFILE_MESSAGES.loginRequired}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar user={user} avatarUrl={avatarUrl} size="lg" />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">{user?.name}</h1>
              </div>
            </div>
          </div>

          <div className="grid border-t border-slate-100 sm:grid-cols-3">
            {statItems.map((item) => (
              <StatSummary key={item.label} item={item} loading={loadingStats} />
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <AccountPanel
            user={user}
            form={form}
            editMode={editMode}
            saving={saving}
            avatarUrl={avatarUrl}
            onChange={onChange}
            onSave={onSave}
            onCancel={onCancel}
            onEdit={() => setEditMode(true)}
            onAvatarChange={onAvatarChange}
            onAvatarReset={resetAvatar}
          />

          <RecentActivityCard
            activities={activities}
            loading={loadingActivity}
            onView={(topicId) => navigate(`/topic/${topicId}`)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <InquiryHistorySection inquiries={inquiries} loading={loadingInquiries} />
          <ContentStatusSection
            items={contentStatus}
            loading={loadingContentStatus}
            onContact={() => navigate('/contact')}
          />
        </div>
      </div>
    </div>
  );
};

const toneClasses = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-500',
};

const Avatar = ({ user, avatarUrl, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-2xl sm:h-20 sm:w-20 sm:text-3xl' : 'h-12 w-12 text-lg';

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-blue-100 to-slate-100 font-bold text-blue-700 shadow-sm`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        user?.name?.[0]?.toUpperCase() || 'U'
      )}
    </div>
  );
};

const StatSummary = ({ item, loading }) => {
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[item.tone]}`}>
        <Icon aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{item.label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-950">{loading ? '...' : item.value}</p>
      </div>
    </div>
  );
};

const RecentActivityCard = ({ activities, loading, onView }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-950">최근 활동</h2>
        <p className="mt-1 text-sm text-slate-500">내가 참여한 토픽 흐름을 빠르게 확인할 수 있습니다.</p>
      </div>
    </div>

    {loading ? (
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    ) : activities.length === 0 ? (
      <EmptyState icon={FaCommentDots} title="아직 활동이 없습니다" description="토픽에 투표하거나 댓글을 남기면 이곳에 표시됩니다." />
    ) : (
      <div className="mt-5 divide-y divide-slate-100">
        {activities.slice(0, 6).map((item, idx) => (
          <ActivityRow
            key={`${item.topic_id || 'activity'}-${idx}`}
            title={item.title}
            date={formatDateOnly(item.created_at)}
            onView={item.topic_id ? () => onView(item.topic_id) : undefined}
          />
        ))}
      </div>
    )}
  </section>
);

const AccountPanel = ({
  user,
  form,
  editMode,
  saving,
  avatarUrl,
  onChange,
  onSave,
  onCancel,
  onEdit,
  onAvatarChange,
  onAvatarReset,
}) => (
  <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-950">계정 정보</h2>
        <p className="mt-1 text-sm text-slate-500">이름과 프로필 이미지를 관리합니다.</p>
      </div>
      {editMode ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
        >
          수정
        </button>
      )}
    </div>

    <div className="mt-5 space-y-4">
      <Field label="이름">
        {editMode ? (
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">{user?.name}</p>
        )}
      </Field>
      <Field label="이메일">
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">{user?.email}</p>
      </Field>
      <Field label="가입일">
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          {formatDateOnly(user?.joinedAt)}
        </p>
      </Field>
      <Field label="프로필 이미지">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
            이미지 선택
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </label>
          {avatarUrl && (
            <button type="button" onClick={onAvatarReset} className="text-sm font-semibold text-red-500 hover:underline">
              삭제
            </button>
          )}
        </div>
      </Field>
    </div>
  </aside>
);

const Field = ({ label, children }) => (
  <div>
    <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>
    {children}
  </div>
);

const ActivityRow = ({ title, date, onView }) => (
  <button
    type="button"
    onClick={onView}
    disabled={!onView}
    className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent"
  >
    <div className="min-w-0">
      <p className="line-clamp-1 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{date}</p>
    </div>
    <FaChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
  </button>
);

const EmptyState = ({ icon, title, description }) => (
  <div className="mt-5 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
      {React.createElement(icon, { 'aria-hidden': true })}
    </span>
    <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

const InquiryHistorySection = ({ inquiries, loading }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <SectionHeader title="내 문의 내역" description="접수한 문의와 처리 상태를 확인할 수 있습니다." />

    {loading ? (
      <p className="mt-5 text-sm text-slate-500">문의 내역을 불러오는 중입니다.</p>
    ) : inquiries.length === 0 ? (
      <EmptyState icon={FaUserCircle} title="문의 내역이 없습니다" description="문의가 필요하면 고객센터에서 새 문의를 남길 수 있습니다." />
    ) : (
      <div className="mt-5 space-y-3">
        {inquiries.slice(0, 3).map((inquiry) => (
          <InquiryHistoryItem key={inquiry.inquiry_id} inquiry={inquiry} />
        ))}
      </div>
    )}
  </section>
);

const InquiryHistoryItem = ({ inquiry }) => {
  const statusLabel = INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status;

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700">
            {statusLabel}
          </span>
          <h3 className="mt-2 line-clamp-1 text-sm font-bold text-slate-900">{inquiry.title}</h3>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{formatDateOnly(inquiry.created_at)}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{inquiry.content}</p>

      {inquiry.latest_reason && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <span className="font-bold text-slate-900">처리 사유: </span>
          {inquiry.latest_reason}
        </div>
      )}
    </article>
  );
};

const ContentStatusSection = ({ items, loading, onContact }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <SectionHeader title="콘텐츠 조치 내역" description="관리자 조치가 적용된 토픽과 댓글을 확인할 수 있습니다." />

    {loading ? (
      <p className="mt-5 text-sm text-slate-500">콘텐츠 조치 내역을 불러오는 중입니다.</p>
    ) : items.length === 0 ? (
      <EmptyState icon={FaShieldAlt} title="조치된 콘텐츠가 없습니다" description="현재 관리자 조치가 적용된 토픽이나 댓글이 없습니다." />
    ) : (
      <div className="mt-5 space-y-3">
        {items.slice(0, 3).map((item) => (
          <ContentStatusItem key={`${item.type}-${item.item_id}`} item={item} onContact={onContact} />
        ))}
      </div>
    )}
  </section>
);

const ContentStatusItem = ({ item, onContact }) => {
  const typeLabel = CONTENT_STATUS_LABELS[item.type] || item.type;

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
            관리자 조치
          </span>
          <h3 className="mt-2 line-clamp-1 text-sm font-bold text-slate-900">
            {typeLabel}: {item.title}
          </h3>
        </div>
        <span className="shrink-0 text-xs text-slate-500">
          {item.hidden_at ? formatDateOnly(item.hidden_at) : '-'}
        </span>
      </div>

      {item.content && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{item.content}</p>}

      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <p>{CONTENT_STATUS_NOTICE}</p>
        <button
          type="button"
          onClick={onContact}
          className="mt-2 text-sm font-bold text-slate-900 underline-offset-4 hover:underline"
        >
          문의하기
        </button>
      </div>
    </article>
  );
};

const SectionHeader = ({ title, description }) => (
  <div>
    <h2 className="text-lg font-bold text-slate-950">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

export default Profile;
