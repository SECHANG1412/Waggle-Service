import { useState } from "react";
import api from "../utils/api";
import {
  handleAuthError,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/alertUtils";

export const useReply = () => {
  const createReply = async (commentId, content) => {
    try {
      const response = await api.post(`/replies`, {
        comment_id: commentId,
        content,
      });

      if (response.status === 200) {
        showSuccessAlert("답글이 성공적으로 작성되었습니다.");
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, "답글을 작성할 수 없습니다.");
      return null;
    }
  };

  const deleteReply = async (replyId) => {
    try {
      const response = await api.delete(`/replies/${replyId}`);

      if (response.status === 200) {
        showSuccessAlert("답글이 성공적으로 삭제되었습니다.");
        return true;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, "답글을 삭제할 수 없습니다.");
      return null;
    }
  };


  const updateReply = async (replyId, content) => {
    try {
      const response = await api.put(`/replies/${replyId}`, { content });

      if (response.status === 200) {
        showSuccessAlert("답글이 성공적으로 수정되었습니다.");
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, "답글을 수정할 수 없습니다.");
      return null;
    }
  };

  return {
    createReply,
    deleteReply,
    updateReply,
  };
};
