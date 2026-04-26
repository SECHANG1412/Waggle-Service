import { COMMON_MESSAGES, REPLY_MESSAGES } from '../constants/messages';
import api from '../utils/api';
import {
  handleAuthError,
  showConfirmDialog,
  showErrorAlert,
} from '../utils/alertUtils';

export const useReply = () => {
  const isSuccess = (status) => status >= 200 && status < 300;

  const createReply = async (commentId, content, parentReplyId = null) => {
    try {
      const response = await api.post('/replies', {
        comment_id: commentId,
        content,
        parent_reply_id: parentReplyId,
      });

      if (isSuccess(response.status)) return response.data;
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, REPLY_MESSAGES.createFailed);
      return null;
    }
  };

  const deleteReply = async (replyId) => {
    try {
      const confirm = await showConfirmDialog(
        REPLY_MESSAGES.deleteConfirmTitle,
        REPLY_MESSAGES.deleteConfirmText,
        COMMON_MESSAGES.delete,
        COMMON_MESSAGES.cancel,
        '#EF4444',
        '#9CA3AF'
      );
      if (!confirm.isConfirmed) return false;

      const response = await api.delete(`/replies/${replyId}`);

      if (isSuccess(response.status)) {
        return true;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, REPLY_MESSAGES.deleteFailed);
      return null;
    }
  };

  const updateReply = async (replyId, content) => {
    try {
      const response = await api.put(`/replies/${replyId}`, { content });

      if (isSuccess(response.status)) return response.data;
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, REPLY_MESSAGES.updateFailed);
      return null;
    }
  };

  return {
    createReply,
    deleteReply,
    updateReply,
  };
};
