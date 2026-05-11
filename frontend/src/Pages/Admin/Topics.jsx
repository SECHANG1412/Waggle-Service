import ContentModerationPage from './ContentModerationPage';

const AdminTopics = () => (
  <ContentModerationPage
    title="토픽 관리"
    description="운영 기준에 맞지 않는 토픽을 영구 삭제합니다."
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
  />
);

export default AdminTopics;
