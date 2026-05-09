import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COMMON_MESSAGES, TOPIC_MESSAGES } from '../../constants/messages';
import { voteColors } from '../../constants/voteColors';
import { useAuth } from '../../hooks/auth-context';
import { useLike } from '../../hooks/useLike';
import { useTopic } from '../../hooks/useTopic';
import { useVote } from '../../hooks/useVote';
import { useConfirm } from '../../hooks/confirm-context';
import Chart from './Chart';
import Comments from './Comments';
import Header from './layout/Header';
import InfoBar from './layout/InfoBar';
import VoteButtons from './layout/VoteButtons';

const SingleTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopicById, deleteTopic } = useTopic();
  const { toggleTopicLike } = useLike();
  const { submitVote } = useVote();
  const { user: authUser } = useAuth();
  const { confirm } = useConfirm();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchState, setFetchState] = useState('idle');

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    setFetchState('loading');

    const topicData = await getTopicById(id);

    if (topicData === null) {
      setTopic(null);
      setFetchState('not-found');
      setLoading(false);
      return;
    }

    if (topicData === undefined) {
      setTopic(null);
      setFetchState('error');
      setLoading(false);
      return;
    }

    setTopic(topicData);
    setFetchState('ready');
    setLoading(false);
  }, [id, getTopicById]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const onLikeClick = async () => {
    const result = await toggleTopicLike(id);
    if (result !== null) {
      setTopic((prev) => ({
        ...prev,
        has_liked: !prev.has_liked,
        like_count: prev.has_liked ? prev.like_count - 1 : prev.like_count + 1,
      }));
    }
  };

  const onVote = async (index) => {
    if (topic?.has_voted) return;
    const confirmed = await confirm({
      title: '투표하시겠습니까?',
      description: '투표는 한 번만 가능하며 선택 후 변경할 수 없습니다.',
      confirmText: '투표하기',
      cancelText: COMMON_MESSAGES.cancel,
      actionOrder: 'confirm-first',
    });
    if (!confirmed) return;

    const success = await submitVote({ topicId: id, voteIndex: index });
    if (success) await fetchTopic();
  };

  const onDelete = async () => {
    const confirmed = await confirm({
      title: TOPIC_MESSAGES.deleteConfirmTitle,
      description: TOPIC_MESSAGES.deleteConfirmText,
      confirmText: COMMON_MESSAGES.delete,
      cancelText: COMMON_MESSAGES.cancel,
      variant: 'danger',
    });
    if (!confirmed) return;

    const success = await deleteTopic(id);
    if (success) {
      navigate('/');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span>토픽을 불러오는 중입니다.</span>
      </div>
    );

  if (fetchState === 'not-found')
    return (
      <div className="rounded-lg bg-slate-50 py-10 text-center">
        <p className="text-lg text-slate-500">{TOPIC_MESSAGES.notFound}</p>
      </div>
    );

  if (fetchState === 'error')
    return (
      <div className="rounded-lg bg-slate-50 py-10 text-center">
        <p className="text-lg text-slate-500">{TOPIC_MESSAGES.loadError}</p>
      </div>
    );

  if (!topic) return null;

  const commentCount = topic.comment_count ?? topic.comments_count ?? 0;
  const colors = voteColors[topic.vote_options.length] || [];
  const votePanel = (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-950">지금 투표하기</h2>
      <VoteButtons
        voteOptions={topic.vote_options}
        voteResults={topic.vote_results}
        totalVotes={topic.total_vote}
        hasVoted={topic.has_voted}
        useVoteIndex={topic.user_vote_index}
        onVote={onVote}
        colors={colors}
      />
      <p className="mt-5 text-center text-sm font-medium text-slate-500">
        한 번 투표하면 변경할 수 없습니다.
      </p>
    </section>
  );

  return (
    <div className="bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <main className="space-y-5">
          <Header
            title={topic.title}
            description={topic.description}
            category={topic.category}
            authorName={topic.author_name}
            createdAt={topic.created_at}
            commentCount={commentCount}
            liked={topic.has_liked}
            likes={topic.like_count}
            onLikeClick={onLikeClick}
            actions={
              authUser?.user_id === topic.user_id ? (
                <button
                  onClick={onDelete}
                  className="min-h-10 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  {COMMON_MESSAGES.delete}
                </button>
              ) : null
            }
          />

          <div className="lg:hidden">{votePanel}</div>

          <Chart topicId={topic.topic_id} voteOptions={topic.vote_options} />
          <div className="lg:hidden">
            <InfoBar totalVotes={topic.total_vote} category={topic.category} />
          </div>
          <Comments topicId={id} />
        </main>

        <aside className="hidden space-y-5 lg:sticky lg:top-6 lg:block">
          {votePanel}
          <InfoBar totalVotes={topic.total_vote} category={topic.category} />
        </aside>
      </div>
    </div>
  );
};

export default SingleTopic;
