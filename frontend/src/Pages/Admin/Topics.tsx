import ContentModerationPage from './ContentModerationPage';
import type { TopicAdminRead } from '../../types';
import { formatDateTime } from '../../utils/date';

const formatExpiration = (value: string | null) => {
  if (!value) return '마감 없음';
  return formatDateTime(value, 'ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  });
};

const AdminTopics = () => (
  <ContentModerationPage<TopicAdminRead>
    title="토픽 관리"
    description="운영 기준에 맞지 않는 토픽을 영구 삭제합니다."
    listEndpoint="/manage-api/topics"
    getItemId={(topic) => topic.topic_id}
    getItemTitle={(topic) => topic.title}
    getItemDescription={(topic) => topic.description || '설명 없음'}
    getItemMeta={(topic) => [
      { label: '토픽 번호', value: topic.topic_id },
      { label: '작성자 번호', value: topic.user_id },
      { label: '카테고리', value: topic.category },
      { label: '상태', value: topic.is_closed ? '마감됨' : '진행 중' },
      { label: '마감 시간', value: formatExpiration(topic.expires_at) },
    ]}
    deleteEndpoint={(topicId) => `/manage-api/topics/${topicId}/delete`}
  />
);

export default AdminTopics;
