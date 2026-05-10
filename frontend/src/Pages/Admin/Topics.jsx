import ContentModerationPage from './ContentModerationPage';

const AdminTopics = () => (
  <ContentModerationPage
    title="토픽 관리"
    description="토픽을 날짜와 상태별로 확인하고, 문제가 있는 토픽을 삭제 또는 복구합니다."
    listEndpoint="/manage-api/topics"
    getItemId={(topic) => topic.topic_id}
    getItemTitle={(topic) => topic.title}
    getItemDescription={(topic) => topic.description || '설명 없음'}
    getItemMeta={(topic) => [
      { label: '토픽 ID', value: topic.topic_id },
      { label: '작성자 ID', value: topic.user_id },
      { label: '카테고리', value: topic.category },
    ]}
    deleteEndpoint={(topicId) => `/manage-api/topics/${topicId}/delete`}
    restoreEndpoint={(topicId) => `/manage-api/topics/${topicId}/restore`}
  />
);

export default AdminTopics;
