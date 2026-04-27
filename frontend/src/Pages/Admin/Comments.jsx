import ContentModerationPage from './ContentModerationPage';

const AdminComments = () => (
  <ContentModerationPage
    title="댓글 관리"
    description="부적절한 댓글을 삭제하지 않고 숨김 처리하거나 다시 노출합니다."
    listEndpoint="/manage-api/comments"
    getItemId={(comment) => comment.comment_id}
    getItemTitle={(comment) => `댓글 #${comment.comment_id}`}
    getItemDescription={(comment) => comment.content}
    getItemMeta={(comment) => [
      { label: '댓글 ID', value: comment.comment_id },
      { label: '토픽 ID', value: comment.topic_id },
      { label: '작성자 ID', value: comment.user_id },
    ]}
    hideEndpoint={(commentId) => `/manage-api/comments/${commentId}/hide`}
    unhideEndpoint={(commentId) => `/manage-api/comments/${commentId}/unhide`}
  />
);

export default AdminComments;
