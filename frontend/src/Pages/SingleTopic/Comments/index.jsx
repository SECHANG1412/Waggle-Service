import React, { useCallback, useEffect, useState } from 'react';
import { COMMENT_MESSAGES, COMMON_MESSAGES, REPLY_MESSAGES } from '../../../constants/messages';
import { useAuth } from '../../../hooks/auth-context';
import { useComment } from '../../../hooks/useComment';
import { useLike } from '../../../hooks/useLike';
import { useReply } from '../../../hooks/useReply';
import { showConfirmDialog, showLoginRequiredAlert } from '../../../utils/alertUtils';
import CommentItem from './CommentItem';
import PaginationControls from './PaginationControls';

const Comments = ({ topicId }) => {
  const { getComments, createComment, updateComment, deleteComment } = useComment();
  const { createReply, updateReply, deleteReply } = useReply();
  const { toggleCommentLike, toggleReplyLike } = useLike();
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  const fetchComment = useCallback(async () => {
    const result = await getComments(topicId);
    setComments(result || []);
  }, [getComments, topicId]);

  useEffect(() => {
    fetchComment();
    setCurrentPage(1);
  }, [topicId, fetchComment]);

  const ensureAuth = async (message) => {
    if (isAuthLoading) return false;
    if (!isAuthenticated) {
      await showLoginRequiredAlert(message);
      return false;
    }
    return true;
  };

  const onCreateComment = async (e) => {
    e?.preventDefault();
    if (!(await ensureAuth(COMMENT_MESSAGES.loginRequiredCreate))) return;
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const result = await createComment(topicId, newComment.trim());
    setIsSubmitting(false);
    if (result) {
      setNewComment('');
      fetchComment();
    }
  };

  const onDeleteComment = async (commentId) => {
    const confirm = await showConfirmDialog(
      COMMENT_MESSAGES.deleteConfirmTitle,
      COMMENT_MESSAGES.deleteConfirmText,
      COMMON_MESSAGES.delete,
      COMMON_MESSAGES.cancel,
      '#EF4444',
      '#9CA3AF'
    );

    if (confirm.isConfirmed) {
      const success = await deleteComment(commentId);
      if (success) fetchComment();
    }
  };

  const guardedAction = async (action, message) => {
    if (!(await ensureAuth(message))) return null;
    return action();
  };

  const onCommentActions = {
    onEdit: (commentId, content) =>
      guardedAction(() => updateComment(commentId, content), COMMENT_MESSAGES.loginRequiredEdit),
    onDelete: (commentId) =>
      guardedAction(() => onDeleteComment(commentId), COMMENT_MESSAGES.loginRequiredDelete),
    onLike: (commentId) =>
      guardedAction(() => toggleCommentLike(commentId), COMMENT_MESSAGES.loginRequiredLike),
    onReply: (commentId, content, parentReplyId = null) =>
      guardedAction(
        () => createReply(commentId, content, parentReplyId),
        REPLY_MESSAGES.loginRequiredCreate
      ),
    onReplyEdit: (replyId, content) =>
      guardedAction(() => updateReply(replyId, content), REPLY_MESSAGES.loginRequiredEdit),
    onReplyDelete: (replyId) =>
      guardedAction(() => deleteReply(replyId), REPLY_MESSAGES.loginRequiredDelete),
    onReplyLike: (replyId) =>
      guardedAction(() => toggleReplyLike(replyId), REPLY_MESSAGES.loginRequiredLike),
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentComments = comments.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(comments.length / itemsPerPage);

  const isLocked = !isAuthLoading && !isAuthenticated;
  const replyCount = comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
  const activeCommentCount = comments.filter((c) => !c.is_deleted).length;
  const totalCommentCount = activeCommentCount + replyCount;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        댓글 <span className="text-blue-600">({totalCommentCount})</span>
      </h2>
      <form onSubmit={onCreateComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isLocked ? '로그인 후 댓글을 작성할 수 있습니다.' : '댓글을 작성해 주세요...'}
          className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          rows={3}
          disabled={isLocked}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting || isLocked}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-500/60 disabled:cursor-not-allowed"
          >
            댓글 작성
          </button>
        </div>
      </form>
      <div className="space-y-6 mt-6">
        {currentComments.map((comment) => (
          <CommentItem key={comment.comment_id} item={comment} actions={onCommentActions} refresh={fetchComment} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};

export default Comments;
