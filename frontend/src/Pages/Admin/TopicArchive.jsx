import ContentModerationPage from './ContentModerationPage';

const AdminTopicArchive = () => (
  <ContentModerationPage
    title="토픽 삭제 보관함"
    description="삭제 처리된 토픽을 확인하고 필요하면 복구합니다."
    archiveMode
    archivePath="/manage/topics/archive"
    listPath="/manage/topics"
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

export default AdminTopicArchive;
