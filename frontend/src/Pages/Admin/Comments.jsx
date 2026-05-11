import ContentModerationPage from './ContentModerationPage';

const AdminComments = () => (
  <ContentModerationPage
    title="댓글 관리"
    description="운영 기준에 맞지 않는 댓글을 영구 삭제합니다."
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
  />
);

export default AdminComments;
