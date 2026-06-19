import { useCallback } from 'react';
import { COMMENT_MESSAGES, COMMON_MESSAGES } from '../constants/messages';
import type { CommentCreateRequest, CommentRead, CommentUpdateRequest } from '../types';
import api from '../utils/api';
import { handleAuthError, showErrorAlert, showSuccessAlert } from '../utils/alertUtils';

export const useComment = () => {
  const isSuccess = (status: number) => status >= 200 && status < 300;

  const createComment = useCallback(async (topicId: number | string, content: string) => {
    try {
      const payload: CommentCreateRequest = {
        topic_id: Number(topicId),
        content,
      };
      const response = await api.post<CommentRead>('/comments', payload);

      if (isSuccess(response.status)) {
        showSuccessAlert(COMMENT_MESSAGES.createSuccess);
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, COMMENT_MESSAGES.createFailed);
      return null;
    }
  }, []);

  const getComments = useCallback(async (topicId: number | string) => {
    try {
      const response = await api.get<CommentRead[]>(`/comments/by-topic/${topicId}`);

      if (isSuccess(response.status)) {
        return response.data;
      }
      showErrorAlert(new Error(COMMON_MESSAGES.apiError), COMMENT_MESSAGES.fetchFailed);
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return;
      showErrorAlert(error, COMMENT_MESSAGES.fetchFailed);
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number | string) => {
    try {
      const response = await api.delete<CommentRead>(`/comments/${commentId}`);

      if (isSuccess(response.status)) {
        showSuccessAlert(COMMENT_MESSAGES.deleteSuccess);
        return true;
      }
      showErrorAlert(new Error(COMMON_MESSAGES.apiError), COMMENT_MESSAGES.deleteFailed);
      return false;
    } catch (error) {
      if (await handleAuthError(error)) return;
      showErrorAlert(error, COMMENT_MESSAGES.deleteFailed);
      return false;
    }
  }, []);

  const updateComment = useCallback(async (commentId: number | string, content: string) => {
    try {
      const payload: CommentUpdateRequest = { content };
      const response = await api.put<CommentRead>(`/comments/${commentId}`, payload);

      if (isSuccess(response.status)) {
        showSuccessAlert(COMMENT_MESSAGES.updateSuccess);
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, COMMENT_MESSAGES.updateFailed);
      return null;
    }
  }, []);

  return {
    createComment,
    getComments,
    deleteComment,
    updateComment,
  };
};
