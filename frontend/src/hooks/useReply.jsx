import { useState } from "react";

export const useReply = () => {
  const createReply = async (commentId, content) => {
    return;
  };

  const deleteReply = async (replyId) => {
    return false;
  };

  const updateReply = async (replyId, content) => {
    return;
  };

  return {
    createReply,
    deleteReply,
    updateReply,
  };
};
