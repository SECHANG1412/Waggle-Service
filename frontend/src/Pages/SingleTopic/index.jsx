import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COMMON_MESSAGES, TOPIC_MESSAGES } from '../../constants/messages';
import { voteColors } from '../../constants/voteColors';
import { useAuth } from '../../hooks/auth-context';
import { useLike } from '../../hooks/useLike';
import { useTopic } from '../../hooks/useTopic';
import { useVote } from '../../hooks/useVote';
import { showConfirmDialog, showVoteConfirmDialog } from '../../utils/alertUtils';
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
    const confirm = await showVoteConfirmDialog();
    if (!confirm.isConfirmed) return;

    const success = await submitVote({ topicId: id, voteIndex: index });
    if (success) await fetchTopic();
  };

  const onDelete = async () => {
    const confirm = await showConfirmDialog(
      TOPIC_MESSAGES.deleteConfirmTitle,
      TOPIC_MESSAGES.deleteConfirmText,
      COMMON_MESSAGES.delete,
      COMMON_MESSAGES.cancel,
      '#EF4444',
      '#9CA3AF'
    );
    if (!confirm.isConfirmed) return;
    const success = await deleteTopic(id);
    if (success) {
      navigate('/');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mr-3" />
        <span>불러오는 중입니다...</span>
      </div>
    );

  if (fetchState === 'not-found')
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-500">{TOPIC_MESSAGES.notFound}</p>
      </div>
    );

  if (fetchState === 'error')
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-500">{TOPIC_MESSAGES.loadError}</p>
      </div>
    );

  if (!topic) return null;

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
      <Header
        title={topic.title}
        liked={topic.has_liked}
        likes={topic.like_count}
        onLikeClick={onLikeClick}
        actions={
          authUser?.user_id === topic.user_id ? (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"
            >
              {COMMON_MESSAGES.delete}
            </button>
          ) : null
        }
      />
      <p className="text-gray-700 mb-6 leading-relaxed">{topic.description}</p>
      <Chart topicId={topic.topic_id} voteOptions={topic.vote_options} />
      <InfoBar createdAt={topic.created_at} totalVotes={topic.total_vote} />
      <VoteButtons
        voteOptions={topic.vote_options}
        voteResults={topic.vote_results}
        totalVotes={topic.total_vote}
        hasVoted={topic.has_voted}
        useVoteIndex={topic.user_vote_index}
        onVote={onVote}
        colors={voteColors[topic.vote_options.length]}
      />
      <Comments topicId={id} />
    </div>
  );
};

export default SingleTopic;
