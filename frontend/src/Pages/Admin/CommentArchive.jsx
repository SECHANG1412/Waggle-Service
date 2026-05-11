import ContentModerationPage from './ContentModerationPage';

const AdminCommentArchive = () => (
  <ContentModerationPage
    title="댓글 삭제 보관함"
    description="삭제 처리된 댓글을 확인하고 필요하면 복구합니다."
    archiveMode
    archivePath="/manage/comments/archive"
    listPath="/manage/comments"
    listEndpoint="/manage-api/comments"
    getItemId={(comment) => comment.comment_id}
    getItemTitle={(comment) => `댓글 #${comment.comment_id}`}
    getItemDescription={(comment) => comment.content}
    getItemMeta={(comment) => [
      { label: '댓글 ID', value: comment.comment_id },
      { label: '토픽 ID', value: comment.topic_id },
      { label: '작성자 ID', value: comment.user_id },
    ]}
    deleteEndpoint={(commentId) => `/manage-api/comments/${commentId}/delete`}
    restoreEndpoint={(commentId) => `/manage-api/comments/${commentId}/restore`}
  />
);

export default AdminCommentArchive;
