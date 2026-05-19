import { COMMON_MESSAGES, REPLY_MESSAGES } from '../constants/messages';
import type { ReplyRead } from '../types';
import { useConfirm } from './confirm-context';
import api from '../utils/api';
import {
  handleAuthError,
  showErrorAlert,
} from '../utils/alertUtils';

export const useReply = () => {
  const { confirm } = useConfirm();
  const isSuccess = (status: number) => status >= 200 && status < 300;

  const createReply = async (
    commentId: number | string,
    content: string,
    parentReplyId: number | string | null = null
  ) => {
    try {
      const response = await api.post<ReplyRead>('/replies', {
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

  const deleteReply = async (replyId: number | string) => {
    try {
      const confirmed = await confirm({
        title: REPLY_MESSAGES.deleteConfirmTitle,
        description: REPLY_MESSAGES.deleteConfirmText,
        confirmText: COMMON_MESSAGES.delete,
        cancelText: COMMON_MESSAGES.cancel,
        variant: 'danger',
      });
      if (!confirmed) return false;

      const response = await api.delete<ReplyRead>(`/replies/${replyId}`);

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

  const updateReply = async (replyId: number | string, content: string) => {
    try {
      const response = await api.put<ReplyRead>(`/replies/${replyId}`, { content });

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
