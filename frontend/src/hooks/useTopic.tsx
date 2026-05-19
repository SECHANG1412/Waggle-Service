import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { TOPIC_MESSAGES } from '../constants/messages';
import type { TopicCreateRequest, TopicListParams, TopicRead } from '../types';
import api from '../utils/api';
import { handleAuthError, showErrorAlert, showSuccessAlert } from '../utils/alertUtils';

type TopicId = number | string;

export const useTopic = () => {
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async ({ sort, limit, offset, category, search }: TopicListParams) => {
    setLoading(true);
    try {
      const params = {
        sort,
        limit,
        offset,
        category,
        ...(search && { search }),
      };
      const response = await api.get<TopicRead[]>('/topics', {
        params,
      });

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      showErrorAlert(error, TOPIC_MESSAGES.fetchFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pinTopic = useCallback(async (topicId: TopicId) => {
    try {
      const response = await api.post<boolean>(`/topics/${topicId}/pin`);
      return response.status === 200;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.pinFailed);
      return false;
    }
  }, []);

  const unpinTopic = useCallback(async (topicId: TopicId) => {
    try {
      const response = await api.delete<boolean>(`/topics/${topicId}/pin`);
      return response.status === 200;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.unpinFailed);
      return false;
    }
  }, []);

  const countAllTopics = useCallback(async (category?: string, search?: string) => {
    setLoading(true);
    try {
      const params = {
        category,
        ...(search && { search }),
      };
      const response = await api.get<number>('/topics/count', {
        params,
      });

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      showErrorAlert(error, TOPIC_MESSAGES.countFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTopic = useCallback(async (topicData: TopicCreateRequest) => {
    setLoading(true);
    try {
      const response = await api.post<TopicRead>('/topics', topicData);

      if (response.status === 200) {
        showSuccessAlert(TOPIC_MESSAGES.createSuccess);
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, TOPIC_MESSAGES.createFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopicById = useCallback(async (topicId: TopicId) => {
    setLoading(true);
    try {
      const response = await api.get<TopicRead>(`/topics/${topicId}`);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      if (await handleAuthError(error)) return undefined;
      showErrorAlert(error, TOPIC_MESSAGES.detailFetchFailed);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTopic = useCallback(async (topicId: TopicId) => {
    setLoading(true);
    try {
      const response = await api.delete<boolean>(`/topics/${topicId}`);
      if (response.status === 200) {
        showSuccessAlert(TOPIC_MESSAGES.deleteSuccess);
        return true;
      }
      return false;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.deleteFailed);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchTopics,
    countAllTopics,
    addTopic,
    getTopicById,
    deleteTopic,
    pinTopic,
    unpinTopic,
  };
};
