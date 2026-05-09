import React, { useCallback, useEffect, useState } from 'react';
import { FaRegCommentDots } from 'react-icons/fa';
import { COMMENT_MESSAGES, COMMON_MESSAGES, REPLY_MESSAGES } from '../../../constants/messages';
import { useAuth } from '../../../hooks/auth-context';
import { useConfirm } from '../../../hooks/confirm-context';
import { useComment } from '../../../hooks/useComment';
import { useLike } from '../../../hooks/useLike';
import { useReply } from '../../../hooks/useReply';
import { showLoginRequiredAlert } from '../../../utils/alertUtils';
import CommentItem from './CommentItem';
import PaginationControls from './PaginationControls';

const Comments = ({ topicId }) => {
  const { getComments, createComment, updateComment, deleteComment } = useComment();
  const { createReply, updateReply, deleteReply } = useReply();
  const { toggleCommentLike, toggleReplyLike } = useLike();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { confirm } = useConfirm();

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
    const confirmed = await confirm({
      title: COMMENT_MESSAGES.deleteConfirmTitle,
      description: COMMENT_MESSAGES.deleteConfirmText,
      confirmText: COMMON_MESSAGES.delete,
      cancelText: COMMON_MESSAGES.cancel,
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteComment(commentId);
    if (success) fetchComment();
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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-3 sm:p-5">
        <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
          댓글 <span className="text-blue-600">({totalCommentCount})</span>
        </h2>
        <form onSubmit={onCreateComment} className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isLocked ? '로그인 후 댓글을 남길 수 있습니다.' : '의견을 남겨주세요.'}
            className="min-h-10 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 sm:min-h-11 sm:px-4 sm:py-3"
            rows={1}
            disabled={isLocked}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting || isLocked}
            className="min-h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500/60 sm:min-h-11 sm:px-6 sm:py-2.5"
          >
            댓글 작성
          </button>
        </form>
      </div>

      <div className="p-3 sm:p-5">
        {currentComments.length > 0 ? (
          <div className="space-y-5 sm:space-y-6">
            {currentComments.map((comment) => (
              <CommentItem key={comment.comment_id} item={comment} actions={onCommentActions} refresh={fetchComment} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center sm:min-h-36 sm:py-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:h-14 sm:w-14">
              <FaRegCommentDots className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <p className="mt-3 text-base font-bold text-slate-900 sm:mt-4 sm:text-lg">아직 댓글이 없습니다.</p>
            <p className="mt-1 text-sm text-slate-500">첫 번째 의견을 남겨보세요.</p>
          </div>
        )}

        {totalPages > 1 && (
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </section>
  );
};

export default Comments;
