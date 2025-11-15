import { useState } from "react";

const initialDummyComments = [
  {
    comment_id: 1,
    user_id: 1,
    topic_id: 1,
    content: "더미 댓글 내용1",
    created_at: "2025-01-01T12:00:00Z",
    username: "더미 유저 이름1",
    like_count: 4,
    has_liked: false,
    replies: [
      {
        reply_id: 1,
        comment_id: 1,
        user_id: 3,
        content: "첫 번째 댓글에 대한 첫 번째 답글",
        created_at: "2025-01-01T13:00:00Z",
        username: "답글 유저1",
        like_count: 2,
        has_liked: false,
      },
      {
        reply_id: 102,
        comment_id: 1,
        user_id: 4,
        content: "첫 번째 댓글에 대한 두 번째 답글",
        created_at: "2025-01-01T14:00:00Z",
        username: "답글 유저2",
        like_count: 1,
        has_liked: true,
      },
    ],
  },
  {
    comment_id: 2,
    user_id: 2,
    topic_id: 1,
    content: "더미 댓글 내용2",
    created_at: "2025-02-01T12:00:00Z",
    username: "더미 유저 이름2",
    like_count: 6,
    has_liked: true,
    replies: [
      {
        reply_id: 2,
        comment_id: 2,
        user_id: 5,
        content: "두 번째 댓글에 대한 답글",
        created_at: "2025-02-01T13:00:00Z",
        username: "답글 유저3",
        like_count: 0,
        has_liked: false,
      },
    ],
  },
];

export const useComment = () => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(initialDummyComments);

  const getComments = async (topicId) => {
    // 나중에 topicId로 필터링해도 되고, 지금은 전체 반환
    //return comments;
    return Array.from({ length: 40 }, () => [...comments]).flat();
  };

  const createComment = async (topicId, content) => {
    if (!content.trim()) return false;

    const newComment = {
      comment_id: Date.now(), // 임시 ID
      user_id: 999,
      topic_id,
      content,
      created_at: new Date().toISOString(),
      username: "나",
      like_count: 0,
      has_liked: false,
      replies: [],
    };

    setComments((prev) => [...prev, newComment]);
    return true;
  };

  const deleteComment = async (commentId) => {
    setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    return true;
  };

  const updateComment = async (commentId, content) => {
    setComments((prev) =>
      prev.map((c) =>
        c.comment_id === commentId ? { ...c, content } : c
      )
    );
    return true;
  };

  return {
    loading,
    createComment,
    getComments,
    deleteComment,
    updateComment,
  };
};
