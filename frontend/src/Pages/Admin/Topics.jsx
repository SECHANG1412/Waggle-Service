import ContentModerationPage from './ContentModerationPage';

const AdminTopics = () => (
  <ContentModerationPage
    title="토픽 관리"
    description="부적절한 토픽을 삭제하지 않고 숨김 처리하거나 다시 노출합니다."
    listEndpoint="/manage-api/topics"
    getItemId={(topic) => topic.topic_id}
    getItemTitle={(topic) => topic.title}
    getItemDescription={(topic) => topic.description || '-'}
    getItemMeta={(topic) => [
      { label: '토픽 ID', value: topic.topic_id },
      { label: '작성자 ID', value: topic.user_id },
      { label: '카테고리', value: topic.category },
    ]}
    hideEndpoint={(topicId) => `/manage-api/topics/${topicId}/hide`}
    unhideEndpoint={(topicId) => `/manage-api/topics/${topicId}/unhide`}
  />
);

export default AdminTopics;
