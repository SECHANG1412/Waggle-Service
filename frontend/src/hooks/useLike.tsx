import { LIKE_MESSAGES } from '../constants/messages';
import api from '../utils/api';
import { handleAuthError, showErrorAlert } from '../utils/alertUtils';

export const useLike = () => {
  const toggleTopicLike = async (topicId: number | string) => {
    try {
      const response = await api.put<boolean>(`/likes/topic/${topicId}`);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, LIKE_MESSAGES.toggleFailed);
      return null;
    }
  };

  const toggleCommentLike = async (commentId: number | string) => {
    try {
      const response = await api.put<boolean>(`/likes/comment/${commentId}`);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, LIKE_MESSAGES.toggleFailed);
      return null;
    }
  };

  const toggleReplyLike = async (replyId: number | string) => {
    try {
      const response = await api.put<boolean>(`/likes/reply/${replyId}`);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, LIKE_MESSAGES.toggleFailed);
      return null;
    }
  };

  return {
    toggleTopicLike,
    toggleCommentLike,
    toggleReplyLike,
  };
};
